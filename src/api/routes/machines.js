const express = require('express');
const persistence = require('../../lib/persistence');
const { errorHandler } = require('../../middlewares');
const { createMachines } = require('../../lib/persistence');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    persistence.getAllMachines()
      .then((machineData) => {
        res.status(200)
          .json(machineData);
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
        .send({ message: 'Invalid data. Make sure to include every field.' });
    }

  }
);

router.get('/:machineId', (req, res, next) => {
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

router.put('/:machineId', (req, res, next) => {
  try {
    persistence.updateMachine(Number(req.params.machineId), req.body)
      .then((success) => {
        if (success) {
          res.status(200)
            .send({ message: 'Machine updated successfully.' });
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
    persistence.deleteMachine(Number(req.params.machineId))
      .then((success) => {
        if (success) {
          res.status(200)
            .send({ message: 'Machine deleted successfully.' });
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
