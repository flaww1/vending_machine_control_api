const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { createPaymentIntent } = require('../lib/payment');
const express = require('express');

const router = express.Router();


// Endpoint to handle user's arrival and validate reservation code
router.post('/arrival', async (req, res) => {
    try {
        const { reservationCode } = req.body;

        // Retrieve the reservation details from the database
        const reservation = await prisma.Reservation.findOne({ code: reservationCode });

        if (!reservation) {
            // Reservation code not found
            return res.status(404).json({ message: 'Invalid reservation code' });
        }

        if (reservation.status !== 'ACTIVE') {
            // Reservation is not active
            return res.status(400).json({ message: 'Reservation is not active' });
        }

        // Perform additional checks such as expiration time, vending machine association, etc.

        // Grant access to the product
        let reservation.paymentStatus = 'PENDING';

        if (reservation.paymentMethod === 'APP') {
            // Handle payment in the app
            // Implement payment processing logic or integrate with a payment gateway
            // Set the paymentStatus to 'completed' if the payment is successful
            createPaymentIntent(reservation.reservationId);
            reservation.paymentStatus = 'COMPLETED';
        } else if (reservation.paymentMethod === 'MACHINE') {
            // Handle payment at the machine
            // No payment processing required in the app
            // The payment will be collected physically at the machine
            reservation.paymentStatus = 'PENDING';
        } else {
            // Invalid payment method
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Update the reservation status and payment status
        reservation.status = 'REDEEMED';
        reservation.paymentStatus = paymentStatus;
        await reservation.save();

        return res.status(200).json({ message: 'Reservation successfully redeemed', paymentStatus });
    } catch (error) {
        console.error('Error handling user arrival:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;


