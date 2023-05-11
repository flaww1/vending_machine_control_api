const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Handling GET requests to /machines',
  });
});

router.post('/', (req, res, next) => {
  const machine = {
    id: req.body.id,
    type: req.body.type,
  };
  res.status(200).json({
    message: 'Handling POST requests to /machines',
    createdMachine: machine,
  });
});

router.get('/:machineId', (req, res, next) => {
  const id = req.params.machineId;
  if (id === 'special') {
    res.status(200).json({
      message: 'You discovered the special id',
    });
  } else {
    res.status(200).json({
      message: 'You passed an ID',
    });
  }
});

router.patch('/:machineId', (req, res, next) => {
  res.status(200).json({
    message: 'Updated machine!',
  });
});

router.delete('/:machineId', (req, res, next) => {
  res.status(200).json({
    message: 'Deleted machine!',
  });
});

module.exports = router;
