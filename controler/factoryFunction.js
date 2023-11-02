const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Features = require('../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document is found with this ID', 404));
    }

    res.status(204).json({
      status: 'successful',
      message: 'Item is deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document is found with this ID', 404));
    }

    res.status(200).json({
      status: 'successful',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tours: doc,
      },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;

    // const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      return next(new AppError('No document is found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new Features(Model.find(filter), req.query)
      .filtering() //function are difined in ultils/APIFeatures file
      .sorting()
      .limitFields()
      .paging();

    const doc = await features.query;
    //4)Sending back the query.

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        tours: doc,
      },
    });
  });
