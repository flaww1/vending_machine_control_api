const express = require('express');

const persistence = require('../../lib/persistence');

const {errorHandler, defaultErr} = require('../../lib/error');
const {getProductsValidator} = require('../../lib/validation');


const router = express.Router();

// generate all user accessible product routes here

router.get('/', (req, res) => {
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


// list which machines have a product
router.get('/:productId', async (req, res) => {
    const productId = parseInt(req.params.productId);

    try {
        const products = await persistence.getProductById(productId);
        const machines = await persistence.getMachinesByProductId(productId);


        res.json({ products, machines});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to retrieve product information'});
    }
});





module.exports = router;
