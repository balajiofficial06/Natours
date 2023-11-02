const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `the entered ${err.path} : ${err.value} is not found`;
  return new AppError(message, 400);
};

const handleDuplicateValuesDb = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Name ${value} is already exist try new name`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const { message } = err; //== const message = err.message

  return new AppError(message, 400);
};

const handlewebTokenError = () =>
  new AppError('invaild token please login again', 401);

const handleTokenExpire = () =>
  new AppError('your token is expired please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOprational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //loging on console
    console.log('Error 💢', err);

    //send the respose error
    res.status(500).json({
      status: 'error',
      message: 'Someting went worng',
    });
  }
};

// error handling middleware
module.exports = (err, req, res, next) => {
  ///by default when middleware is created with 4 argumets it will be a error middleware
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'CastError') {
      error = handleCastErrorDb(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateValuesDb(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDb(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handlewebTokenError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpire();
    }

    sendErrorProd(error, res);
  }
};
