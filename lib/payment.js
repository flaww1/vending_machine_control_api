
const persistence = require("../lib/persistence")
const stripe = require("stripe")(process.env.STRIPE_CLIENT_SECRET);

async function createPaymentIntent(reservationId) {
    try {


        const reservation = await persistence.getReservationById(reservationId)
        debugger;
        if (!reservation) {
            throw new Error('Invalid reservation');
        }


        if (reservation.status !== 'AWAITING_PAYMENT') {
            throw new Error('Invalid reservation status');
        }

        // Calculating the total order price
        const product = await persistence.getProductByReservationId(reservationId);
        console.log(product);
        const totalPrice = product.price * reservation.quantity;
        debugger;
        // Creating payment intent (in the lowest denominator for EUR: cents)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100,
            currency: 'eur',
            metadata: {
                reservationId: reservationId,
                userId: reservation.userId,
            },
        });

        return paymentIntent.client_secret;
    } catch (e) {
        console.error('Error creating payment intent:', e);
        throw new Error('Error creating payment intent');
    }
}

async function handlePaymentMethods(reservation) {

    const { paymentMethod } = reservation;

    if (paymentMethod === 'APP') {
        // Handle payment in the app
        const paymentIntentClientSecret = await createPaymentIntent(reservation.reservationId);

        return {
            paymentMethod: 'APP',
            clientSecret: paymentIntentClientSecret,
            reservationCode: reservation.code,
        };
    } else if (paymentMethod === 'MACHINE') {
        // Handle payment at the machine
        return {
            paymentMethod: 'MACHINE',
            reservationCode: reservation.code,
        };
    } else {
        throw new Error('Unsupported payment option');
    }
}


module.exports = {
    createPaymentIntent,
    handlePaymentMethods,

}
