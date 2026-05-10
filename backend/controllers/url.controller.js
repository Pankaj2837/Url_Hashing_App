const { createShortUrl, getLongUrl } = require("../models/Url.model");
const { redisClient } = require("../config/redis.config");
const { getPoolForCode } = require("../config/sharding.config");
const shorten = async (req, res) => {
  try {
    const { longUrl } = req.body;

    // 1. Basic Validation
    if (!longUrl) {
      return res.status(400).json({ message: "URL is required" });
    }
    // 1. Validation
    if (!validator.isURL(longUrl)) {
      return res.status(400).json({ message: "Invalid URL provided" });
    }

    // 2. Collision Handling: Check if this URL already exists for this user
    const existing = await getExistingUrl(longUrl, userId);
    if (existing) {
      return res.status(200).json({
        ...existing,
        message: "URL already shortened",
      });
    }
    // 2. Call Model (which handles Transaction + Base62)
    const result = await createShortUrl(longUrl);

    // 3. Respond
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    console.log("Incoming request for code:", shortCode); // Log #1

    // 1. Check Redis First (O(1) Speed)
    const cachedUrl = await redisClient.get(shortCode);

    console.log("Redis result:", cachedUrl);
    if (cachedUrl) {
      // ⚡ ASYNC ANALYTICS: Increment click count in Redis
      // We use a separate key like 'clicks:c'
      redisClient.incr(`clicks:${shortCode}`);
      console.log("🚀 Cache Hit!");
      return res.redirect(cachedUrl);
    }
    console.log("🚀 Cache Miss!");
    /*  Without Sharding logic comment out the below code and uncomment the code below it.
        const longUrl = await getLongUrl(shortCode);

        if (longUrl) {
          // 3. Adaptive Read: Warm the cache for next time
          // Set an expiry (TTL) of 24 hours (86400 seconds)
          await redisClient.set(shortCode, longUrl, { EX: 86400 });
          await redisClient.incr(`clicks:${shortCode}`); // Count first click
          return res.redirect(longUrl);
        } else {
          return res.status(404).json({ message: "URL not found" });
        }
    */
    // 2. If not in Redis, determine the shard and query SQL Server
    const pool = await getPoolForCode(shortCode);
    const result = await pool
      .request()
      .input("shortCode", sql.VarChar, shortCode)
      .query("SELECT long_url FROM URLs WHERE short_code = @shortCode");

    if (result.recordset.length > 0) {
      const longUrl = result.recordset[0].long_url;
      // 3. Adaptive Read: Warm the cache for next time
      // Set an expiry (TTL) of 24 hours (86400 seconds)
      await redisClient.set(shortCode, longUrl, { EX: 86400 });
      await redisClient.incr(`clicks:${shortCode}`); // Count first click
      return res.redirect(longUrl);
    } else {
      return res.status(404).json({ message: "URL not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { shorten, redirect };
