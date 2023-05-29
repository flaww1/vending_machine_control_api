const express = require('express');

const persistence = require('../../lib/persistence');

const {errorHandler, defaultErr} = require('../../lib/error');
const {getProductsValidator, getAllMachinesValidator} = require('../../lib/validation');

const authentication = require("../../lib/authentication");
const authorization = require("../../lib/authorization");

const router = express.Router();


router.get('/products', authentication.check,authorization.isUserOrAdmin,(req, res) => {
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
router.get('/products/:productId',authentication.check,authorization.isUserOrAdmin, async (req, res) => {
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


// list all machines
router.get('/machines', authentication.check,  authorization.isUserOrAdmin,(req, res) => {
    try {
        persistence
            .getAllMachines(
                req.query.limit,
                req.query.page,
                req.query.keywords,
                req.query.sort,
                req.query.location,
                req.query.status,
                req.query.type,

            )
            .then((machineData) => {
                res.status(200).json(machineData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

// list products by machine id
router.get('/machines/:machineId', authentication.check,authorization.isUserOrAdmin,async (req, res) => {
    const machineId = parseInt(req.params.machineId);

    try {
        const products = await persistence.getProductsByMachineId(machineId);

        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve products by machine ID" });
    }
});



module.exports = router;
