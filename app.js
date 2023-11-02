const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorContorler = require('./controler/errorControler');

const app = express();
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');
const reviewRouter = require('./routes/reviewRouter');

//middelwawre

// set security http header
app.use(helmet());

//Limit the request same API
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this Ip please try agian later',
});

app.use('/api', limiter);

//Body parser, reading data from Body into req.body in JSON formate
app.use(express.json({ limit: '10kb' }));

//data sanitization againest NoSQL querys

app.use(mongoSanitize());

//data sanitization againest xss

app.use(xss());

//paramenter prevent population

app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//serving static file
app.use(express.static(`${__dirname}/public`));

//test MiddleWare, add the reqestTime to the req object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);

//catch all the routes are not maching with the above router
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorContorler);

//runing server

module.exports = app;
