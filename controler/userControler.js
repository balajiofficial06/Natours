const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryFunction');

const filterObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //create the error for posting password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password update, please /updateNewPassword route',
        400
      )
    );
  }
  //remove the unwanted objects.
  const filteredBody = filterObj(req.body, 'name', 'email');
  //update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //find the userand update the ative filed

  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log(user);

  //set the querry midleware to ignore the active filed

  //send the response

  res.status(204).json({
    status: 'successful',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getSingleUser = factory.getOne(User);
// Do not update password
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getAllUser = factory.getAll(User);
