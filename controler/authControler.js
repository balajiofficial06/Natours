const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.password,
    passwordChangedAt: req.body.passwordChangedAt,
    photo: req.body.photo,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //check the email and password is entered
  const { email, password } = req.body;

  if (!email || !password) {
    //when we pass an agument in next it will go to error middelware
    return next(new AppError('please enter the email and password', 404));
  }

  //check the email and password is existing and matching

  const user = await User.findOne({ email }).select('+password');

  if (!user && !(await user.correctPassword(password, user.password))) {
    return next(new AppError('please enter the vaild email and password', 401));
  }

  //send the token to the user
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) check the token is pressent or not
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('you are logged out, please login again'), 401);
  }
  //verify the token

  const decode = await jwt.verify(token, process.env.JWT_SECRET);

  //verify if the user is still in database

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError('This token user no longer exists in database'));
  }

  //check the user is changed the password after logined
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User rencently changed the password, login again', 401)
    );
  }
  //grant access to user
  req.user = currentUser;
  next();
});

exports.restrict =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('Your not authorised for this action', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //verify the user and get user data

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  //genrate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); ///to save the updated user doument in database, and disableing the validator

  //send the mail to the user

  const resetUrl = `${req.protocol}://${req.hostname}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Did you forgot your password? Use the Url to reset ${resetUrl}, kinldy ignore if it's not you`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password only vaild for 10min',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link is sent to your Email',
    });
  } catch (err) {
    this.passwordResetToken = undefined;
    this.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There is error in sending the Email please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  // if the token is not expired and user is there, set the new password
  if (!user) {
    return next(new AppError('Token is invaild or expired'), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  //reset the password changed at field

  //send the jwt to login
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get the user document
  const user = await User.findById(req.user._id, '+password');

  //check the posted password is correct or not
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError('please enter the current password correctly', 400)
    );
  }

  //if so, update the password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //loguser in , send jwt
  createSendToken(user, 200, res);
});
