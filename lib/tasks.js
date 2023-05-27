const {getExpiredReservations, cancelReservation, unlockProductQuantity, initiateRefund} = require('./reservation');

const cron = require('node-cron');

// Define the cron schedule (runs every minute)
const RESERVATION_EXPIRATION_CHECK_INTERVAL = 60 * 1000; // 1 minute

// Define the cron schedule (runs every minute)
function scheduleReservationExpirationTask() {
    setInterval(async () => {
        try {
            const expiredReservations = await getExpiredReservations();

            for (const reservation of expiredReservations) {
                // Handle cancellation and unlocking of product quantity for each expired reservation
                await initiateRefund(reservation)
                await cancelReservation(reservation);
                await unlockProductQuantity(reservation);
            }
        } catch (error) {
            console.error('Error while checking for expired reservations:', error);
        }
    }, RESERVATION_EXPIRATION_CHECK_INTERVAL);
}


module.exports = {
    scheduleReservationExpirationTask,
}
