const express = require('express');
const {createReservation, updateReservationStatus, updateReservationPaymentStatus, updateReservationCodeStatus} = require('../../lib/reservation');
const {reservationValidator} = require("../../lib/validation");
const {handlePaymentMethods} = require("../../lib/payment");
const {getReservationById, getReservationByCode} = require("../../lib/persistence");



const router = express.Router();

// Define the reservation endpoint
router.post('/', /*reservationValidator()*/async (req, res) => {


    const reservation = createReservation({
        userId: req.body.userId,
        productId: req.body.productId,
        machineId: req.body.machineId,
        shelfId: req.body.shelfId,
        quantity: req.body.quantity,
        paymentMethod: req.body.paymentMethod,

    });


    try {
        const paymentMethods = await handlePaymentMethods(reservation);
        res.json(paymentMethods);
    } catch (error) {
        console.error('Error while handling payment options:', error);
        res.status(400).json({error: 'Invalid payment option'});

        reservation.save()
            .then((savedReservation) => {
                res.json(savedReservation);
            })
            .catch((error) => {
                console.error('Error while creating reservation:', error);
                res.status(500).json({error: 'An error occurred while creating a reservation'});
            });

    }
});

router.get('/machine-display',  (req, res) => {
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
router.post('/machine-payment/:machineId', async (req, res) => {
    const reservationCode = req.body.reservationCode;
    const paymentAmount = req.body.paymentAmount;
    const machineId = parseInt(req.params.machineId);

    // Validate the reservation code against the database records
    const reservation = getReservationByCode(reservationCode);
    const isProductAvailable = checkProductAvailability(machineId);



    if (reservation.paymentStatus === reservation.PaymentStatus.COMPLETED) {
        return res.status(400).json({error: 'Reservation already paid'});
    }


    // Verify if the collected payment amount matches the total price of the reserved product
    if (paymentAmount === reservation.total_price) {

        // Verify if the product is available in the machine
        const isProductAvailable = checkProductAvailability(reservation.productId);

        if (!isProductAvailable) {
            return res.status(400).json({ error: 'Product is unavailable in the machine' });
        // Update the reservation status to mark it as paid
        await updateReservationPaymentStatus(reservation.reservationId, 'COMPLETED');
        await updateReservationStatus(reservation.reservationId, 'COMPLETED')
        await updateReservationCodeStatus(reservation.reservationId, 'USED');

        await reservation.save();

        dispenseProduct();
        // Implement the logic to dispense the product using your machine interface

        return res.json({message: 'Payment successful'});
    } else {
        return res.status(400).json({error: 'Invalid payment amount'});
    }

});

module.exports = router;
