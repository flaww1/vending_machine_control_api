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

async function createReservation(params) {
    try {
        const reservationCode = generateReservationCode();

        const reservation = await prisma.reservation.create({
            data: {
                user: {connect: {id: params.userId}},
                product: {connect: {id: params.productId}},
                machine: {connect: {id: params.machineId}},
                shelf: {connect: {id: params.shelfId}},
                total_price: params.total_price,
                quantity: params.quantity,

                reservationCode: reservationCode,
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
            where: {reservationId: reservationId},
        });

        // Check if the reservation exists
        if (!reservation) {
            throw new Error('Invalid reservation ID');
        }

        // Update the reservation with the new status
        const updatedReservation = await prisma.reservation.update({
            where: {reservationId: reservationId},
            data: {status: newStatus},
        });

        // Return the success response
        return {
            success: true,
            message: 'Reservation status updated successfully',
            reservation: updatedReservation,
        };
    } catch (error) {
        throw new Error('Failed to update reservation status');

    }
}

async function updateReservationCodeStatus(reservationCode, status) {
    try {
        await prisma.reservation.update({
            where: {
                reservationCode: reservationCode
            },
            data: {
                reservationCodeStatus: status
            }
        });
        return true;
    } catch (e) {

        throw new Error('Failed to update code status');
    }

}


async function updateReservationPaymentStatus(reservationId, newPaymentStatus) {
    try {
        // Retrieve the reservation from the database
        const reservation = await prisma.reservation.findUnique({
            where: {reservationId: reservationId},
        });

        // Check if the reservation exists
        if (!reservation) {
            throw new Error('Invalid reservation ID');
        }

        // Update the reservation with the new status
        const updatedReservation = await prisma.reservation.update({
            where: {reservationId: reservationId},
            data: {paymentStatus: newPaymentStatus},
        });

        // Return the success response
        return {
            success: true,
            message: 'Reservation payment status updated successfully',
            reservation: updatedReservation,
        };
    } catch (error) {

        throw new Error('Failed to update reservation payment status');

    }
}


module.exports = {
    updateReservationStatus,
    updateReservationPaymentStatus,
    updateReservationCodeStatus,
    createReservation,


};
