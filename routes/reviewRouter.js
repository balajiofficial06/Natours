const express = require('express');
const authControler = require('../controler/authControler');
const reviewControler = require('../controler/reviewControler');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authControler.protect,
    authControler.restrict('user'),
    reviewControler.setTourUserId,
    reviewControler.createReview
  )
  .get(reviewControler.getAllreviews);

router
  .route('/:id')
  .delete(reviewControler.deleteReview)
  .patch(reviewControler.updateReview)
  .get(reviewControler.getOnereview);

module.exports = router;
