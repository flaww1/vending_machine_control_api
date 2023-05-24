const express = require('express');
const persistence = require("../../lib/persistence");
const {defaultErr} = require("../../lib/error");
const router = express.Router();

// Route to handle all admin CRUD operations
router.post('/', (req, res, next) => {
    // Implement logic for admin CRUD operations
});

/* PRODUCT ROUTES */

router.get('/products', (req, res) => {
    // Implement logic for listing all products
    try {
        persistence
            .getAllProducts(
                req.query.limit,
                req.query.page,
                req.query.keywords,
                req.query.sort,
                {min: req.query.min_price, max: req.query.max_price},
                req.query.type,
            )
            .then((productData) => {
                res.status(200).json(productData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});
router.get('/create-product/:productId', (req, res) => {
    // Implement logic for creating a product
});

router.get('/update-product/:productId', (req, res) => {
    // Implement logic for updating a product
});

router.get('/delete-product/:productId', (req, res) => {
    // Implement logic for deleting a product
});

/* MACHINE ROUTES */

router.get('/machines', (req, res) => {
    // Implement logic for listing all machines
});

router.get('/create-machine/:machineId', (req, res) => {
    // Implement logic for creating a machine
});

router.get('/update-machine/:machineId', (req, res) => {

    // Implement logic for updating a machine
});

router.get('/delete-machine/:machineId', (req, res) => {
    // Implement logic for deleting a machine
});

/* USER ROUTES */

router.get('/users', (req, res) => {
    // Implement logic for listing all users
});

router.get('/create-user/:userId', (req, res) => {
    // Implement logic for creating a user
});

router.get('/update-user/:userId', (req, res) => {
    // Implement logic for updating a user
});

router.get('/delete-user/:userId', (req, res) => {
    // Implement logic for deleting a user
});

/* RESERVATION ROUTES */

router.get('/reservations', (req, res) => {
    // Implement logic for listing all reservations
});

router.get('/create-reservation/:reservationId', (req, res) => {
    // Implement logic for creating a reservation
});

router.get('/update-reservation/:reservationId', (req, res) => {
    // Implement logic for updating a reservation
});

router.get('/delete-reservation/:reservationId', (req, res) => {
    // Implement logic for deleting a reservation
});

/* FEEDBACK ROUTES */

router.get('/feedbacks', (req, res) => {
    // Implement logic for listing all feedbacks
});

router.get('/create-feedback/:feedbackId', (req, res) => {
    // Implement logic for creating a feedback
});

router.get('/update-feedback/:feedbackId', (req, res) => {

    // Implement logic for updating a feedback
});

router.get('/delete-feedback/:feedbackId', (req, res) => {
    // Implement logic for deleting a feedback
} );

/* REQUEST ROUTES */

router.get('/requests', (req, res) => {

    // Implement logic for listing all requests
} );

router.get('/create-request/:requestId', (req, res) => {
    // Implement logic for creating a request
} );

router.get('/update-request', (req, res) => {
    // Implement logic for updating a request
} );

router.get('/delete-request', (req, res) => {
    // Implement logic for deleting a request
} );

/* PROVIDER ROUTES */

router.get('/providers', (req, res) => {
    // Implement logic for listing all providers
} );

router.get('/create-provider', (req, res) => {
    // Implement logic for creating a provider
} );

router.get('/update-provider', (req, res) => {
    // Implement logic for updating a provider
} );

router.get('/delete-provider', (req, res) => {
    // Implement logic for deleting a provider

} );

/* STOCK ROUTES */


module.exports = router;



