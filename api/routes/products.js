const express = require('express');
const persistence = require('../../lib/persistence');
const { errorHandler, defaultErr } = require('../../lib/error');
const { getProductsValidator } = require('../../lib/validation');


const router = express.Router();

// generate all product routes here

router.get('/',  (req, res) => {
    try {
        persistence
            .getAllProducts(
                req.query.limit,
                req.query.page,
                req.query.category,
                req.query.keywords,
                req.query.sort,
                { min: req.query.min_price, max: req.query.max_price },
                req.query.type,
                req.query.include_unbuyable
            )
            .then((productData) => {
                res.status(200).json(productData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});


router.get('/:productId', (req, res, next) => {
  try {
    persistence.getProductById(Number(req.params.productId))
      .then((product) => {
        res.status(200)
          .json(product);
      });

  } catch (e) {
    console.log(e);
    res.status(500)
      .send(errorHandler());
  }
});


router.delete('/:productId', (req, res, next) => {
  try {
    persistence.deleteProduct(Number(req.params.productId))
      .then((product) => {
        res.status(200)
          .json(product);
      });

  } catch (e) {
    console.log(e);
    res.status(500)
      .send(errorHandler());
  }
});

router.put('/:productId', (req, res, next) => {
  try {
    persistence.updateProduct(Number(req.params.productId), req.body)
      .then((updatedProduct) => {
        if (updatedProduct) {
          res.status(200)
            .json(updatedProduct);

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

});


module.exports = router;
