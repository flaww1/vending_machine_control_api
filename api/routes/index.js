const express = require('express');

const machines = require('./machines');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/machines', machines);

module.exports = router;
