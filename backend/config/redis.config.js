import redis from "redis";
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

const redisClient = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis reconnection failed after 10 attempts");
        return new Error("Redis connection exhausted");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) =>
  console.log("Redis Client Error:", err.message),
);

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("⚡ Connected to Redis via Docker Network");
    }
  } catch (err) {
    console.error("Could not connect to Redis:", err.message);
  }
};

export { redisClient, connectRedis };
