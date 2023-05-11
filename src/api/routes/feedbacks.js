const express = require('express');

const router = express.Router();

router.post('/', (req, res, next) => {
  const feedback = {
    productId: req.body.productId,
    userId: req.body.userId,
    feedbackMessage: req.body.feedbackMessage,
  };
  res.status(201).json({
    message: 'feedback created',
    createdFeedback: feedback,
  });
});

router.get('/:feedbackId', (req, res, next) => {
  res.status(200).json({
    message: 'feedback details',
    feedbackId: req.params.feedbackId,
  });
});

router.delete('/:feedbackId', (req, res, next) => {
  res.status(200).json({
    message: 'feedback deleted',
    orderId: req.params.orderId,
  });
});

module.exports = router;
