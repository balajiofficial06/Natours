const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const factory = require('./factoryFunction');

exports.setTourUserId = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.getAllreviews = factory.getAll(Review);

exports.getOnereview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
