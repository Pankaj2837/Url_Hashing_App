import redis from "redis";

const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("⚡ Connected to Redis");
  }
};

export { redisClient, connectRedis };
