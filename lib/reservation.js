const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const {reservationValidator} = require('./validation');
const{getProductById, updateProduct} = require('./persistence');
const {updatePaymentStatus} = require('./payment');


async function generateReservationCode() {
    // Generate a random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if the code already exists in the database
    const existingReservation = await prisma.reservation.findUnique({
        where: {
            reservationCode: code,
        },
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
        const reservationCode = await generateReservationCode();

        const reservation = await prisma.reservation.create({
            data: {
                user: {
                    connect: { userId: params.userId },
                },
                product: {
                    connect: { productId: params.productId },
                },
                machine: {
                    connect: { machineId: params.machineId },
                },
                shelf: {
                    connect: { shelfId: params.shelfId },
                },
                total_price: params.total_price,
                quantity: parseInt(params.quantity),
                reservationCode,
                paymentMethod: params.paymentMethod,
                status: 'AWAITING_PAYMENT',
            },
        });

        return reservation;
    } catch (e) {
        console.error('Error while creating reservation:', e.message);
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

const checkProductQuantity = async (machineId, productId, requestedQuantity) => {
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
async function initiateRefund(reservationId, refundAmount) {
    try {
        // Use the payment provider's API or SDK to initiate the refund
        const refund = await paymentProvider.initiateRefund(paymentId, refundAmount);

        // Handle the refund response from the payment provider
        if (refund.status === 'success') {
            // Update the reservation and payment status in the database
            await updateReservationStatus(reservationId, 'Canceled');
            await updateReservationPaymentStatus(paymentId, 'Refunded');

            // Unlock the product quantity
            await unlockProductQuantity(productId, quantity);

            console.log(`Refund successful. Payment ID: ${paymentId}, Refund ID: ${refund.id}`);

            return true;
        } else {
            console.error(`Refund failed. Payment ID: ${paymentId}, Error: ${refund.error}`);
            throw new Error('Refund failed');
        }
    } catch (error) {
        console.error('Error while initiating refund:', error);
        throw new Error('Failed to initiate refund');
    }
}



async function unlockProductQuantity(productId, quantity) {
    try {
        // Retrieve the product from the database
        const product = await getProductById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        // Unlocking the reserved quantity
        product.quantity += quantity;

        // Saving the updated product in the database
        await updateProduct(product);

        console.log(`Unlocked ${quantity} quantity of product ${product.name}`);

        return true;
    } catch (error) {
        console.error('Error while unlocking product quantity:', error);
        throw new Error('Failed to unlock product quantity');
    }
}



module.exports = {
    updateReservationStatus,
    updateReservationPaymentStatus,
    updateReservationCodeStatus,
    createReservation,
    checkProductAvailabilityInMachine,
    checkProductQuantity,
    dispenseProduct,
    getExpiredReservations,
    initiateRefund,
    unlockProductQuantity,

};
