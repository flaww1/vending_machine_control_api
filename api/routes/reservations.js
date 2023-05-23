const express = require('express');
const prisma
const persistence = require('../../lib/persistence');


const router = express.Router();

// Define the reservation endpoint
router.post('/reservations', async (req, res) => {
    try {
        const { userId, productId, machineId } = req.body;

        // Generate a unique reservation code
        const reservationCode = generateReservationCode();

        // Create a reservation record in the database
        const reservation = await prisma.reservation.create({
            data: {
                user: { connect: { id: userId } },
                product: { connect: { id: productId } },
                machine: { connect: { id: machineId } },
                reservationCode,
                isPaid: false, // Assuming the reservation is initially unpaid
            },
        });

        // Return the reservation details to the client
        res.status(201).json({ reservation });
    } catch (error) {
        console.error('Failed to create reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
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
