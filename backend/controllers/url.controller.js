import { createShortUrl, getLongUrl } from "../models/Url.model.js";
import sql from "mssql";
import { redisClient } from "../config/redis.config.js";
import { getPoolForCode } from "../config/sharding.config.js";
import validator from "validator";
import { urlService } from "../services/url.service.js";
const shorten = async (req, res) => {
  try {
    const { longUrl } = req.body;
    const userId = req.user; // From 'protect' middleware

    if (!longUrl || !validator.isURL(longUrl)) {
      return res.status(400).json({ message: "A valid URL is required" });
    }

    const existing = await urlService.findExisting(longUrl, userId);

    if (existing) {
      return res.status(200).json({
        ...existing,
        message: "URL already shortened",
      });
    }

    const result = await urlService.createShort(longUrl, userId);

    return res.status(201).json(result);
  } catch (err) {
    console.error("Shorten Controller Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    console.log("Incoming request for code:", shortCode);

    const cachedUrl = await redisClient.get(shortCode);

    console.log("Redis result:", cachedUrl);
    if (cachedUrl) {
      redisClient.incr(`clicks:${shortCode}`);
      console.log("Cache Hit!");
      return res.redirect(cachedUrl);
    }
    console.log("Cache Miss!");

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

      // Set an expiry (TTL) of 24 hours (86400 seconds)
      await redisClient.set(shortCode, longUrl, { EX: 86400 });

      await redisClient.incr(`clicks:${shortCode}`);

      return res.redirect(longUrl);
    } else {
      return res.status(404).json({ message: "URL not found" });
    }
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Server Error" });
  }
};

const getMyUrls = async (req, res) => {
  try {
    const userId = req.user;
    console.log("object", req.user);
    const urls = await urlService.getUserUrls(userId);
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { shorten, redirect, getMyUrls };
