const express = require('express');
const tourControler = require('../controler/tourControler');
const authControler = require('../controler/authControler');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

// router
//   .route('/:tourId/review')
//   .post(
//     authControler.protect,
//     authControler.restrict('user'),
//     reviewControler.createReview
//   );

router.use('/:tourId/review', reviewRouter);

//rquest routes
// router.param('id', tourControler.idChecker);
router
  .route('/top-5-cheap')
  .get(tourControler.topTours, tourControler.getAllTours);

router.route('/tour-stat').get(tourControler.tourStats);

router
  .route('/')
  .get(authControler.protect, tourControler.getAllTours)
  .post(tourControler.createTour);

router.route('/monthly-plan/:year').get(tourControler.getMonthlyPlan);

router
  .route('/:id')
  .get(tourControler.getSingleTours)
  .patch(tourControler.updateTour)
  .delete(
    authControler.protect,
    authControler.restrict('admin', 'lead-guide'),
    tourControler.deleteTour
  );

module.exports = router;
