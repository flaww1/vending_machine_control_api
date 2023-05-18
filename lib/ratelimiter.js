const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const maxRequestsPerMinute = 100;
const maxConsecutiveFailedAttempts = 5;
const blockDurationMinutes = 10;

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: maxRequestsPerMinute,
    message: 'Too many requests from this IP, please try again later.',
});

const store = new RateLimiterMemory({
    points: maxConsecutiveFailedAttempts,
    duration: blockDurationMinutes * 60, // Convert minutes to seconds
});

const bruteForceProtection = async (req, res, next) => {
    try {
        const ip = req.ip;

        // Consume a point for a failed login attempt
        await store.consume(ip);

        // If the limit is exceeded, block the IP address for the specified duration
        const isBlocked = await store.isBlocked(ip);
        if (isBlocked) {
            return res.status(429).json({ message: 'Too many failed login attempts. Please try again later.' });
        }

        // If the limit is not exceeded, continue to the next middleware
        next();
    } catch (error) {
        // Handle any errors that occur during rate limiting or blocking
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = {
    limiter,
    store,
    bruteForceProtection,
}
