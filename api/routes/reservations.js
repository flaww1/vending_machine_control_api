const express = require('express');
const persistence = require('../../lib/persistence');


const router = express.Router();

// Define the reservation endpoint
router.post('/reservations', (req, res) => {
    const { userId, productId, vendingMachineId } = req.body;

    // Generate a unique reservation code
    const reservationCode = generateReservationCode();

    // Create a new reservation record in the database
    const reservation = new reservation({
        user: userId,
        product: productId,

        vendingMachine: vendingMachineId,
        code: reservationCode
    });

    reservation.save()
        .then((savedReservation) => {
            res.json(savedReservation);
        })
        .catch((error) => {
            console.error('Error while creating reservation:', error);
            res.status(500).json({ error: 'An error occurred while creating a reservation' });
        });
});

// GET reservation code by ID
router.get('/reservations/:id/code', async (req, res) => {
    const reservationId = parseInt(req.params.id);

    try {
        // Retrieve the reservation with the specified ID
        const reservation = await reservation.findUnique({
            where: { id: reservationId },
            select: { code: true },
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Send the reservation code in the response
        res.json({ code: reservation.code });
    } catch (error) {
        console.error('Error retrieving reservation code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
