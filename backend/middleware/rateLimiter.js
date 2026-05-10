const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("../config/redis.config");

const apiLimiter = rateLimit({
  // Store the counts in our Docker Redis
  store: new RedisStore({
    sendCommand: async (...args) => {
      if (!redisClient.isOpen) await redisClient.connect(); // Safety check
      return redisClient.sendCommand(args);
    },
  }),
  windowMs: process.env.RATE_LIMITER_TIME_WINDOW, // Use the time window from environment variables
  max: process.env.IP_LIMIT_NUMBER_OF_REQUESTS_PER_WINDOW, // Limit each IP to n(20) requests per window
  message: {
    message:
      "Too many URLs created from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});

module.exports = apiLimiter;
