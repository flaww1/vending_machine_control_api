const express = require('express');
const {
    updateReservationCodeStatus,
    updateReservationStatus,
    updateReservationPaymentStatus,
    createReservation,
    checkProductAvailabilityInMachine,
    checkQuantityMatch,
    dispenseProduct,
} = require('../../lib/reservation');
const {reservationValidator} = require("../../lib/validation");
const {handlePaymentMethods} = require("../../lib/payment");
const {getReservationById, getReservationByCode, getUserByuserId} = require("../../lib/persistence");
const handler = require('../../lib/handler');


const router = express.Router();

// Define the reservation endpoint
router.post('/reservation', /*reservationValidator()*/ async (req, res) => {

    // creates a reservation and locks the product for it not to be reserved by someone else
    try {
        const reservationExpirationTimeLimit = parseInt(process.env.RESERVATION_EXPIRATION_TIME_LIMIT);
        const reservationExpirationTime = new Date();
        reservationExpirationTime.setMinutes(reservationExpirationTime.getMinutes() + + reservationExpirationTimeLimit);


        const transactionPhase = await prisma.$transaction(async (transaction) => {

            const reservation = await createReservation({
                userId: req.body.userId,
                productId: req.body.productId,
                machineId: req.body.machineId,
                shelfId: req.body.shelfId,
                quantity: req.body.quantity,
                paymentMethod: req.body.paymentMethod,
                expirationTime: reservationExpirationTime,
                transaction,
            });

            const productCheck = await prisma.product.findUnique({
                where: {productId: reservation.productId},
                include: {reservation: true, include: {shelves: true}},
                transaction,
                lock: {mode: 'update'},
            });

            if (productCheck.reservation) {
                throw new Error('Product is already reserved by someone else');
            }
            //Findind the machine containing the product
            const selectedMachineId = req.body.machineId;
            const selectedMachine = productCheck.machines.find(
                (machine) => machine.machineId === selectedMachineId
            );

            if (!selectedMachine) {
                throw new Error('Invalid machine selection');
            }

            //Finding the shelf containing the product
            const selectedShelfId = req.body.shelfId;
            const selectedShelf = selectedMachine.shelves.find(
                (shelf) => shelf.shelfId === selectedShelfId
            );

            if (!selectedShelf) {
                throw new Error('Invalid shelf selection');
            }

            //Checking if there are enough quantities of the product on the shelf
            if (selectedShelf.quantity < reservation.quantity) {
                throw new Error('Insufficient quantity of the product');
            }


            // Reserving the quantity of the product
            const reservedQuantity = selectedShelf.products.reduce((total, product) => {
                if (total < reservation.quantity) {
                    const quantityToReserve = Math.min(reservation.quantity - total, product.quantity);
                    total += quantityToReserve;
                    product.quantity -= quantityToReserve;
                }
                return total;
            }, 0);

            if (reservedQuantity < reservation.quantity) {
                throw new Error('Insufficient quantity of the product');
            }

            //Updating the shelf's quantity
            await prisma.shelf.update({
                where: {shelfId: selectedShelf.shelfId},
                data: {quantity: selectedShelf.quantity},
                transaction,
            });

            //Updating the machine's quantity
            await prisma.machine.update({
                where: {machineId: selectedMachine.machineId},
                data: {quantity: selectedMachine.quantity},
                transaction,
            });

            return reservation;
        });

        res.status(200).json(transactionPhase);
    } catch (error) {
        console.error('Error while creating reservation:', error);
        res.status(500).json({error: 'An error occurred while creating a reservation'});
    }

    // handles the payment methods
    try {
        const paymentMethods = await handlePaymentMethods(reservation);
        res.json(paymentMethods);
    } catch (error) {
        console.error('Error while handling payment options:', error);
        res.status(400).json({error: 'Invalid payment option'});
    }
});


router.get('reservation/machine-display', (req, res) => {
    const reservationCode = req.body.reservationCode;

    const reservation = getReservationByCode(reservationCode);

    if (!reservation) {
        return res.status(400).json({error: 'Invalid reservation code'});
    }

    const product = reservation.product;
    const productName = product.name;
    const productPrice = product.price;
    res.status(200).json([{productName, productPrice}]);

});

// Machine Payment Route
router.post('reservation/machine-payment/:machineId', async (req, res) => {
    const reservationCode = req.body.reservationCode;
    const paymentAmount = req.body.paymentAmount;
    const machineId = parseInt(req.params.machineId);

    try {
        // Validate the reservation code against the database records
        const reservation = getReservationByCode(reservationCode);

        if (reservation.paymentStatus === reservation.PaymentStatus.COMPLETED) {
            return res.status(400).json({ error: 'Reservation already paid' });
        }

        // Verify if the collected payment amount matches the total price of the reserved product
        if (paymentAmount === reservation.total_price) {
            // Verify if the product is available in the machine
            const isProductAvailable = await checkProductAvailabilityInMachine(machineId, reservation.productId);
            const quantityCheck = await checkQuantityMatch(machineId, reservation.productId, reservation.quantity);

            if (!quantityCheck) {
                return res.status(400).json({ error: 'The machine does not have enough quantity of the requested product' });
            }

            if (!isProductAvailable) {
                return res.status(400).json({ error: 'Product is unavailable in the machine' });
            }

            // Update the reservation payment status to mark it as completed
            await updateReservationPaymentStatus(reservation.reservationId, 'COMPLETED');

            // Update the reservation status to mark it as completed
            await updateReservationStatus(reservation.reservationId, 'COMPLETED');

            // Update the reservation code status to mark it as used
            await updateReservationCodeStatus(reservation.reservationId, 'USED');

            // Simulating the product dispensing process
            await dispenseProduct(reservation);

            return res.json({ message: 'Payment successful' });
        } else {
            return res.status(400).json({ error: 'Invalid payment amount' });
        }


    } catch (error) {
        console.error('Error while processing machine payment:', error);
        res.status(500).json({ error: 'An error occurred while processing the payment' });
    }


});

// App Payment Route
router.post('/reservation/app-payment', async (req, res) => {

}

router.post('/payments/webhook', async (req, res) => {

    let event = req.body

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            let user = await getUserByuserId(
                Number(paymentIntent.metadata.user_id))

            console.log(`💸 Received payment for ${paymentIntent.amount/100}€ from ${user.first_name} ${user.last_name}! (Reservation ID: ${paymentIntent.metadata.reservationId})`);

            await handler.postPaymentHandler(
                Number(paymentIntent.metadata.reservationId));

            break;
    }

    return res.status(200).json({received: true})

})

router.get('/payments/config', /*authentication.check*/ (req, res) => {
    // Serving publishable key
    return res.status(200).json({
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY
    })
})



module.exports = router;
