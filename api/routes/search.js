const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler} = require('../../lib/error');


const router = express.Router();
router.get('/machines', (req, res) => {
    const { location, product, price } = req.query;

    // Build the query based on the provided parameters
    const query = {};

    if (location) {
        query.location = location;
    }

    if (product) {
        query.product = product;
    }

    if (price) {
        query.price = price;
    }

    // Perform the database query to fetch the vending machines
    // Adjust the query and database implementation according to your setup
    Machine.find(query)
        .then((machines) => {
            res.json(machines);
        })
        .catch((error) => {
            console.error('Error while searching for vending machines:', error);
            res.status(500).json({ error: 'An error occurred while searching for vending machines' });
        });

});

// Define the search endpoint
router.get('/products', (req, res) => {
    const { name, category, priceMin, priceMax } = req.query;

    // Build the query based on the provided parameters
    const query = {};

    if (name) {
        query.name = { $regex: name, $options: 'i' }; // Perform case-insensitive search
    }

    if (category) {
        query.category = category;
    }

    if (priceMin && priceMax) {
        query.price = { $gte: priceMin, $lte: priceMax };
    }

    // Perform the database query to fetch the products
    // Adjust the query and database implementation according to your setup
    Product.find(query)
        .then((products) => {
            res.json(products);
        })
        .catch((error) => {
            console.error('Error while searching products:', error);
            res.status(500).json({ error: 'An error occurred while searching products' });
        });
});

module.exports = router;
