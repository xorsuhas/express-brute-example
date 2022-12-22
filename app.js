var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ExpressBruteFlexible = require('rate-limiter-flexible/lib/ExpressBruteFlexible');
const redis = require('redis');
const http = require('http');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const redisClient = redis.createClient({
  enable_offline_queue: false,
});

const opts = {
  freeRetries: 10,
  minWait: 1000, // 1 second
  maxWait: 10000, // 10 seconds
  lifetime: 30, // 30 seconds
  storeClient: redisClient,
};

const bruteforce = new ExpressBruteFlexible(
  ExpressBruteFlexible.LIMITER_TYPES.REDIS, 
  opts
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(bruteforce.prevent, function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
