const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// Uncomment the following app.all middleware to handle unmatched routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find the route ${req.originalUrl} on the server!`
  // });
  // const err = new Error(
  //   `Can't find the route ${req.originalUrl} on the server!`
  // );
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);

  next(
    new AppError(`Can't find the route ${req.originalUrl} on the server!`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
