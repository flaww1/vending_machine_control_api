const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler} = require('../../lib/error');
const authentication = require('../../lib/authentication');
const {getAllMachines} = require("../../lib/persistence");
const {getAllMachinesValidator} = require("../../lib/validation");

const router = express.Router();


// list all machines
router.get('/',getAllMachinesValidator(), async (req, res) => {
    try {
        const { type, location, sort, status } = req.query;

        const machines = await getAllMachines({ type, location, sort, status });

        res.json(machines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching machines.' });
    }
});

// list machine by id
router.get('/:machineId/:products', /*authentication.check,*/ (req, res, next) => {
    try {
        persistence.getMachineById(Number(req.params.machineId))
            .then((machine) => {
                res.status(200)
                    .json(machine);
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
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
