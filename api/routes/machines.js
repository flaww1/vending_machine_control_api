const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler, defaultErr} = require('../../lib/error');
const authentication = require('../../lib/authentication');

const {getAllMachinesValidator} = require("../../lib/validation");
const router = express.Router();


// list all machines
router.get('/',  (req, res) => {
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
router.get('/:machineId', async (req, res) => {
    const machineId = parseInt(req.params.machineId);

    try {
        const products = await persistence.getProductsByMachineId(machineId);

        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve products by machine ID" });
    }
});


router.post('/', (req, res, next) => {
        try {

            persistence.createMachines(req.body)
                .then((createdMachine) => {
                    if (createdMachine) {
                        res.status(200)
                            .json(createdMachine);

                    } else {
                        res.status(500)
                            .send(errorHandler());
                    }
                });

        } catch (e) {
            console.log(e);
            res.status(400)
                .send({message: 'Invalid data. Make sure to include every field.'});
        }

    }
);



router.put('/:machineId', (req, res, next) => {
    try {
        persistence.updateMachine(Number(req.params.machineId), req.body)
            .then((success) => {
                if (success) {
                    res.status(200)
                        .send({message: 'Machine updated successfully.'});
                } else {
                    res.status(500)
                        .send(errorHandler());
                }
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});

router.delete('/:machineId', (req, res, next) => {

    try {
        persistence.deleteMachine(userId(req.params.machineId))
            .then((success) => {
                if (success) {
                    res.status(200)
                        .send({message: 'Machine deleted successfully.'});
                } else {
                    res.status(500)
                        .send(errorHandler());
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});


module.exports = router;
