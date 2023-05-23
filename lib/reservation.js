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

async function checkProductAvailabilityInMachine(machineId, productIds) {
    const machine = await prisma.machine.findUnique({
        where: {machineId},
        include: {
            shelves: {
                include: {
                    reservations: {
                        where: {
                            productId: {in: productIds},

                        },
                    },
                },
            },
        },
    });

    const productAvailability = productIds.every((productId) =>
        machine.shelves.some((shelf) =>
            shelf.reservations.every((reservation) => reservation.productId !== productId
            )
        )
    );

    return productAvailability;
}

const checkQuantityMatch = async (machineId, productId, requestedQuantity) => {
    try {
        const productShelf = await prisma.product_Shelf.findFirst({
            where: {
                productId: productId,
                shelf: {
                    machineId: machineId
                }
            }
        });

        if (!productShelf) {
            throw new Error('Product is not available in the specified machine');
        }

        const availableQuantity = productShelf.quantity_inSlot;
        if (requestedQuantity > availableQuantity) {
            throw new Error('Insufficient quantity of the product in the machine');
        }

        return true;
    } catch (error) {
        console.error('Error while checking quantity:', error);
        throw error;
    }
};



async function dispenseProduct() {
    try {
        // Simulate the process of dispensing the product
        console.log('Dispensing the product...');

        console.log('Product dispensed successfully.');
    } catch (error) {
        console.error('Error while dispensing the product:', error);
        throw new Error('Failed to dispense the product');
    }
}

// Helper functions
async function getExpiredReservations() {
    const currentDate = new Date();
    const expiredReservations = await prisma.reservation.findMany({
        where: {
            paymentStatus: 'COMPLETED',
            expirationTime: {
                lte: currentDate,
            },

        },
    });

    return expiredReservations;
}
async function initiateRefund(reservation) {
    // Implement the logic to initiate refund for the reservation


    // For example, if you're using a payment gateway, you might make an API call like:
    // await paymentGateway.initiateRefund(reservation.paymentId);

    // Update the reservation's paymentStatus to 'REFUNDED' in the database
    await prisma.reservation.update({
        where: {
            reservationId: reservation.reservationId,
        },
        data: {
            paymentStatus: 'REFUNDED',
        },
    });

    // Add any other necessary steps related to refund initiation
}

async function cancelReservation(reservation) {
    // Implement the logic to cancel the reservation
    // You may need to perform additional actions such as releasing the product quantity

    // Update the reservation's status to 'CANCELLED' in the database
    await prisma.reservation.update({
        where: {
            reservationId: reservation.reservationId,
        },
        data: {
            status: 'CANCELLED',
        },
    });

    // Add any other necessary steps for reservation cancellation
}


module.exports = {
    updateReservationStatus,
    updateReservationPaymentStatus,
    updateReservationCodeStatus,
    createReservation,
    checkProductAvailabilityInMachine,
    checkQuantityMatch,
    dispenseProduct,
    getExpiredReservations,
    initiateRefund,
    cancelReservation,

};
