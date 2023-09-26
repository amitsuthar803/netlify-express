const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();
app.use(express.json());
app.use('/public', express.static('public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    //this here is just some option to deal with some deprecation warning so when build new app we need to copy and paste it.
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('database connection succesfull!!'));

// //creating document -----------test purpose
// const testEmi = new Emi({
//   date: 15,
//   name: 'Amit',
//   title: '15-tarik-society',
//   emi_start_date: '2022-05-15',
//   no_of_emi: 20,
//   rate_of_intrest: 2,
//   total_loan_amount: 50000,
// });

// importing emi router
const emiRouter = require('./routes/emiRoutes');

app.use('/', emiRouter);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  //creating new error using built in error constructor
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// handling error by using middleware
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
