class AppError extends Error {
  // eslint-disable-next-line constructor-super
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOprational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
