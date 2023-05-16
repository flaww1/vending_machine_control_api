const express = require('express');
const persistence = require('../../lib/persistence');
const { errorHandler } = require('../../middlewares');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    persistence.getAllProducts()
      .then((productData) => {
        res.status(200)
          .json(productData);
      });
  }

});





module.exports = router;
