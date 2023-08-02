const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorsDB = err => {
  const value = err.errmsg.amtch(/(["'])(?:\\.|[^\\])*?\1/)[0];
  console.log(value);
  const message = `Duplicate field values: ${value} Please use another field values`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  //operational errors
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //programming error occurred
  else {
    //1) log the error
    console.log('ERROR', err);

    //2) Generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (error.code === 11000) error = handleDuplicateErrorsDB(err);
    if (error.name === 'Validation Error') error = handleValidationError(err);

    sendErrorProd(err, res);
  }
};
