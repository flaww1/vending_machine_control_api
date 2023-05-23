const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const {reservationValidator} = require('./validation');

async function generateReservationCode() {
    // Generate a random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000);

    // Check if the code already exists in the database
    const existingReservation = await prisma.reservation.findUnique({
        where: {code},
    });

    // If the code already exists, generate a new one
    if (existingReservation) {
        return generateReservationCode();
    }

    // Otherwise, return the unique code
    return code;

}
async function createReservation(params){
    try {
        const reservationCode = generateReservationCode();

        const reservation = await prisma.reservation.create({
            data: {
                user: {connect: {id: params.userId}},
                product: {connect: {id: params.productId}},
                machine: {connect: {id: params.machineId}},
                shelf : {connect: {id: params.shelfId}},
                total_price: params.total_price,
                quantity: params.quantity,

                reservationCode: reservationCode,
                status: 'PENDING', // Assuming the reservation is still being processed
                paymentStatus: 'PENDING', // Assuming the reservation is initially unpaid
                paymentMethod: params.paymentMethod,
            },
        });

        return reservation;
    } catch (e) {

        throw new Error('Failed to create reservation');
    }
}
async function updateReservationStatus(reservationId, newStatus) {
    try {
        // Retrieve the reservation from the database
        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
        });

        // Check if the reservation exists
        if (!reservation) {
            return {
                success: false,
                message: 'Invalid reservation ID',
            };
        }

        // Update the reservation with the new status
        const updatedReservation = await prisma.reservation.update({
            where: {id: reservationId},
            data: {status: newStatus},
        });

        // Return the success response
        return {
            success: true,
            message: 'Reservation status updated successfully',
            reservation: updatedReservation,
        };
    } catch (error) {
        console.error('Error updating reservation status:', error);
        return {
            success: false,
            message: 'An error occurred while updating the reservation status',
        };
    }
}

async function confirmReservation(reservationId) {
    // ... other logic to generate the reservation code and retrieve user information

    // Call the validateReservation function
    const validationResponse = await reservationValidator(reservationId);

    if (validationResponse.success) {
        const {reservation} = validationResponse;
        const reservationCode = reservation.code;

        // Send the reservation code to the user
        // ...
    } else {
        const {message} = validationResponse;
        // Handle the validation failure, display an error message, etc.
        // ...
    }
}

async function handleReservation(reservationId) {
    // ... other logic to handle the reservation

    // Update the reservation status
    const updateStatusResponse = await updateReservationStatus(reservationId, 'completed');

    if (updateStatusResponse.success) {
        // Reservation status updated successfully
        // ...
    } else {
        // Handle the status update failure, display an error message, etc.
        // ...
    }
}

module.exports = {
    updateReservationStatus,
    generateReservationCode,
    confirmReservation,
    handleReservation,
    createReservation
};
