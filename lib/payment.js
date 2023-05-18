const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const persistence   = require("../lib/persistence")
const stripe    = require("stripe")(process.env.STRIPE_CLIENT_SECRET);

async function createPaymentIntent(reservationId) {

    let order = await persistence.getReservationById(reservationId)

    if (!order) {
        return "INVALID_ORDER"
    }

    let isAwaitingPayment = prisma.Reservation.items.every((item) => item.status == "AWAITING_PAYMENT")

    if (!isAwaitingPayment) {
        return "INVALID_STATUS"
    }

    // Calculating the total order price

    totalPrice = persistence.round(prisma.Reservation.items.reduce((accumulator, current) => accumulator + Number(current.price)*Number(current.quantity), 0), 2);

    // Creating payment intent (in the lowest denominator for EUR: cents)

    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice*100,
        currency: 'eur',
        metadata: {
            reservationId: reservationId,
            user_id: prisma.reservation.user_id,
        },
    })

    return paymentIntent.client_secret

}

module.exports = {
    createPaymentIntent
}
