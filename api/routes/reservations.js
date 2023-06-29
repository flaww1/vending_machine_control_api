const express = require('express');
const {
    updateReservationCodeStatus,
    updateReservationStatus,
    updateReservationPaymentStatus,
    createReservation,
    checkProductAvailabilityInMachine,

    dispenseProduct,
    checkProductQuantity, unlockProductQuantity,
} = require('../../lib/reservation');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const {reservationValidator} = require("../../lib/validation");
const {handlePaymentMethods, initiateRefund} = require("../../lib/payment");
const {getReservationById, getReservationsByUserId, getReservationByCode, getUserByuserId, getProductById, getProductByReservationId,getm} = require("../../lib/persistence");
const handler = require('../../lib/handler');

const authentication = require('../../lib/authentication');
const authorization = require('../../lib/authorization');
const router = express.Router();

// Define the reservation endpoint
router.post('/make-reservation/:productId', authentication.check,/*reservationValidator()*/ async (req, res) => {

    const product = await prisma.Product.findUnique({
        where: { productId: parseInt(req.params.productId) },
    });

    console.log('Product:', product);

    try {

        console.log('Creating reservation...');
        const transactionPhase = await prisma.$transaction(async (transaction) => {
            console.log('Transaction started');

            const reservationExpirationTimeLimit = parseInt(process.env.RESERVATION_EXPIRATION_TIME_LIMIT);
            const reservationExpirationTime = new Date();
            reservationExpirationTime.setMinutes(reservationExpirationTime.getMinutes() + reservationExpirationTimeLimit);

            console.log('Reservation expiration time:', reservationExpirationTime);

            const reservation = await createReservation({
                userId: Number(req.user.userId),
                productId: Number(req.params.productId),
                machineId: Number(req.body.machineId),
                shelfId: Number(req.body.shelfId),
                quantity: parseInt(req.body.quantity, 10),
                total_price: product.price * req.body.quantity,
                paymentMethod: req.body.paymentMethod,
                expirationTime: reservationExpirationTime,
                transaction,
            });

            console.log('Reservation created successfully');

            const productCheck = await prisma.Product.findUnique({
                where: {
                    productId: reservation.productId,
                },
                include: {
                    Product_Shelf: {
                        select: {
                            shelfId: true,
                            quantity_inSlot: true,
                            product_shelfId: true, // Include the product_shelfId field
                        },
                    },
                },
            });

            const selectedShelfId = Number(req.body.shelfId);
            let selectedShelf;

            if (Array.isArray(productCheck.Product_Shelf)) {
                selectedShelf = productCheck.Product_Shelf.find((shelf) => shelf.shelfId === selectedShelfId);
            }

            console.log('Selected shelf ID:', selectedShelfId);
            console.log('Selected shelf:', selectedShelf);

            if (!selectedShelf) {
                console.log('Invalid shelf selection');
                throw new Error('Invalid shelf selection');
            }

            console.log('Finding the shelf containing the product...');
            console.log('Shelf found');

            console.log('Checking product quantity...');
            if (selectedShelf.quantity_inSlot < reservation.quantity) {
                throw new Error('Insufficient quantity of the product');
            }

            console.log('Product quantity is sufficient');

            console.log('Reserving the quantity of the product...');
            const reservedQuantity = Math.min(parseInt(selectedShelf.quantity_inSlot), parseInt(reservation.quantity));

            console.log('Product quantity reserved successfully');

            try {
                console.log('selectedShelf:', selectedShelf);
                console.log('reservedQuantity:', reservedQuantity);

                // Updating the product quantity in the shelf
                const productShelfId = selectedShelf.product_shelfId; // Access the product_shelfId
                console.log('productShelfId:', productShelfId)
                const currentQuantity = selectedShelf.quantity_inSlot;
                console.log('currentQuantity:', currentQuantity)
                const updatedQuantity = currentQuantity - reservedQuantity;
                console.log('updatedQuantity:', updatedQuantity)

                await prisma.Product_Shelf.update({
                    where: {
                        product_shelfId: productShelfId,
                    },
                    data: {
                        quantity_inSlot: updatedQuantity,
                    },
                });

                console.log('Updating the shelf quantity...');
            } catch (error) {
                console.error('Error while updating quantities:', error);
                throw new Error('Failed to update quantities');
            }




            return reservation;
        });

        res.status(200).json(transactionPhase);
    } catch (error) {
        console.error('Error while creating reservation:', error);
        res.status(500).json({error: 'An error occurred while creating a reservation'});
    }
});



router.get('/machine-display/:reservationCode', authentication.check,authorization.isUserOrAdmin,async (req, res) => {
    const reservationCode = req.params.reservationCode;
    console.log('reservationCode:', reservationCode)
    const reservation = await getReservationByCode(reservationCode);
    console.log(reservation);
    if (!reservation) {
        return res.status(400).json({ error: 'Invalid reservation code' });
    }

    const product = await getProductByReservationId(reservation.reservationId);

    if (!product || !product.name || !product.price) {
        return res.status(400).json({ error: 'Invalid product data' });
    }

    const { name: productName, price: productPrice } = product;

    res.status(200).json({ productName, productPrice });
});


router.post('/payment/:reservationCode', authentication.check,authorization.isUserOrAdmin,async (req, res) => {
    const reservationCode = req.params.reservationCode;
    const paymentAmount = req.body.paymentAmount;

    debugger;
    try {
        // Validate the reservation code against the database records
        const reservation = await getReservationByCode(reservationCode);

        if (reservation.paymentStatus === 'COMPLETED') {
            return res.status(400).json({ error: 'Reservation already paid' });
        }

        console.log('reservation total price:', reservation.total_price);
        // Verify if the collected payment amount matches the total price of the reserved product
        debugger;
        if (paymentAmount >= reservation.total_price) {
            // Update the reservation payment status to mark it as completed
            await handlePaymentMethods(reservation);


            // Verify if the product is available in the machine
            /*const isProductAvailable = await checkProductAvailabilityInMachine(reservation.machineId, reservation.productId);
            debugger;
            const quantityCheck = await checkProductQuantity(reservation.machineId, reservation.productId, reservation.quantity);

            // double-checking the quantity and availability of the product
            if (!quantityCheck) {
                return res.status(400).json({error: 'The machine does not have enough quantity of the requested product'});
            }

            if (!isProductAvailable) {
                return res.status(400).json({error: 'Product is unavailable in the machine'});
            }*/

            // Update the reservation payment status to mark it as completed
            await updateReservationPaymentStatus(reservation.reservationId, 'COMPLETED');

            // Update the reservation status to mark it as completed
            await updateReservationStatus(reservation.reservationId, 'COMPLETED');

            // Update the reservation code status to mark it as used
            await updateReservationCodeStatus(reservationCode, 'USED');

            // Simulating the product dispensing process
            await dispenseProduct(reservation);

            return res.json({message: 'Payment successful'});
        } else {
            return res.status(400).json({ error: 'Insufficient payment amount' });

        }


    } catch (error) {
        console.error('Error while processing machine payment:', error);
        res.status(500).json({error: 'An error occurred while processing the payment'});
    }


});



    router.post('/payments/webhook', authentication.check,authorization.isUserOrAdmin,async (req, res) => {

        let event = req.body

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                let user = await getUserByuserId(
                    Number(paymentIntent.metadata.user_id))

                console.log(`💸 Received payment for ${paymentIntent.amount / 100}€ from ${user.first_name} ${user.last_name}! (Reservation ID: ${paymentIntent.metadata.reservationId})`);

                await handler.postPaymentHandler(
                    Number(paymentIntent.metadata.reservationId));

                break;
        }

        return res.status(200).json({received: true})

    })

// Reservation cancellation route
    router.put('/cancel/:reservationId', authentication.check,authorization.isUserOrAdmin,async (req, res) => {
        const reservationId = parseInt(req.params.reservationId);

        try {
            // Check if the reservation exists
            const reservation = await getReservationById(reservationId);

            if (!reservation) {
                return res.status(404).json({error: 'Reservation not found'});
            }

            // Check if the reservation has been paid
            if (reservation.paymentStatus === 'COMPLETED') {
                return res.status(400).json({error: 'Cannot cancel a paid reservation, ask for a refund!'});
            }

            // Update the reservation status to 'CANCELED'
            await updateReservationStatus(reservationId, 'CANCELED');

            // Update the payment status to 'CANCELED'
            await updateReservationPaymentStatus(reservationId, 'CANCELED');

            // Unlock the reserved product quantity
            await unlockProductQuantity(reservation.productId, reservation.quantity);

            return res.json({message: 'Reservation canceled successfully'});
        } catch (error) {
            console.error('Error while canceling reservation:', error);
            res.status(500).json({error: 'An error occurred while canceling the reservation'});
        }
    });

router.put('/refund/:reservationId', authentication.check,authorization.isUserOrAdmin, async (req, res) => {
    const reservationId = parseInt(req.params.reservationId);

    try {
        // Check if the reservation exists
        const reservation = await getReservationById(reservationId);

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        // Check if the reservation has been paid
        if (reservation.paymentStatus !== 'COMPLETED') {
            return res.status(400).json({ error: 'Cannot cancel an unpaid reservation' });
        }

        // Initiate the refund
        const refund = await initiateRefund(reservation.paymentIntentId);

        // Update the reservation status to 'REFUNDED'
        await updateReservationStatus(reservationId, 'REFUNDED');

        // Update the payment status to 'REFUNDED'
        await updateReservationPaymentStatus(reservationId, 'REFUNDED');

        // Unlock the reserved product quantity
        await unlockProductQuantity(reservation.productId, reservation.quantity);

        return res.json({ message: 'Reservation canceled and refunded successfully', refund });
    } catch (error) {
        console.error('Error while canceling reservation:', error);
        res.status(500).json({ error: 'An error occurred while refunding the reservation' });
    }
});

router.get('/', authentication.check, async (req, res) => {
    const userId = req.user.userId;

    try {
        const reservations = await getReservationsByUserId(userId);

        return res.json({ reservations });
    } catch (error) {
        console.error('Error while fetching user reservations:', error);
        res.status(500).json({ error: 'An error occurred while fetching user reservations' });
    }
});




    module.exports = router;
