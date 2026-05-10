import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis.config.js";

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args) => {
      if (!redisClient.isOpen) await redisClient.connect();
      return redisClient.sendCommand(args);
    },
  }),
  windowMs: process.env.RATE_LIMITER_TIME_WINDOW, // Use the time window from environment variables
  max: process.env.IP_LIMIT_NUMBER_OF_REQUESTS_PER_WINDOW, // Limit each IP to n(20) requests per window
  message: {
    message:
      "Too many URLs created from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
