const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Professional practice: Connect immediately
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("⚡ Connected to Redis");
  }
};

module.exports = { redisClient, connectRedis };
