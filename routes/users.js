var express = require('express');
var router = express.Router();
const ExpressBruteFlexible = require('rate-limiter-flexible/lib/ExpressBruteFlexible');
const redis = require('redis');
const http = require('http');

const redisClient = redis.createClient({
  url: 'redis://localhost:3000'
});

redisClient.on('connect', () => console.log('Connected to Redis!'));
redisClient.on("error", function (error) {
  console.error(error);
});
redisClient.connect();

const opts = {
  freeRetries: 5,
  minWait: 1000, // 1 second
  maxWait: 5000, // 5 seconds
  lifetime: 30, // 30 seconds
  storeClient: redisClient,
};

const bruteforce = new ExpressBruteFlexible(
  ExpressBruteFlexible.LIMITER_TYPES.REDIS,
  opts
);

/* GET users listing. */
router.get('/', bruteforce.prevent, function (req, res, next) {
  try {
    res.send('respond with a resource');
  } catch (error) {
    res.error(error)
  }

});

module.exports = router;
