import { getPoolForCode } from "../config/sharding.config.js";
import { sql } from "../config/db.config.js";
import { encode } from "../utils/Encoder.util.js";
import { redisClient } from "../config/redis.config.js";

export const urlService = {
  async findExisting(long_url, userId) {
    const pool = await getPoolForCode(userId.toString());

    const result = await pool
      .request()
      .input("long_url", sql.NVarChar, long_url)
      .input("userId", sql.Int, userId)
      .query(
        "SELECT short_code, long_url FROM URLs WHERE long_url = @long_url AND user_id = @userId",
      );

    return result.recordset[0] || null;
  },

  async createShort(long_url, userId) {
    const pool = await getPoolForCode(userId.toString());

    const insertResult = await pool
      .request()
      .input("long_url", sql.NVarChar, long_url)
      .input("userId", sql.Int, userId).query(`
        INSERT INTO URLs (long_url, user_id, clicks, created_at) 
        OUTPUT INSERTED.id 
        VALUES (@long_url, @userId, 0, GETDATE())
      `);

    const newDbId = insertResult.recordset[0].id;

    const short_code = encode(newDbId);
    await pool
      .request()
      .input("id", sql.Int, newDbId)
      .input("short_code", sql.NVarChar, short_code)
      .query("UPDATE URLs SET short_code = @short_code WHERE id = @id");

    try {
      const multi = redisClient.multi();
      multi.setEx(`url:${short_code}`, 86400, long_url);
      multi.setnx(`clicks:${short_code}`, 0);
      multi.sAdd(`user:${userId}:links`, short_code);
      await multi.exec();
    } catch (redisErr) {
      console.error("Redis sync failed, but SQL is safe:", redisErr);
    }

    return { short_code, long_url };
  },
  async getUserUrls(userId) {
    const redisKey = `user:${userId}:links`;

    try {
      const cachedLinks = await redisClient.sMembers(redisKey);

      if (cachedLinks && cachedLinks.length > 0) {
        console.log("Serving 'my-urls' from Redis Cache");
        const pool = await getPoolForCode(userId.toString());
        const result = await pool
          .request()
          .input("userId", sql.Int, userId)
          .query(
            "SELECT short_code, long_url, clicks FROM URLs WHERE user_id = @userId",
          );
        return result.recordset;
      }

      console.log("Cache Miss - Fetching from SQL");
      const pool = await getPoolForCode(userId.toString());
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(
          "SELECT short_code, long_url, clicks FROM URLs WHERE user_id = @userId",
        );

      if (result.recordset.length > 0) {
        const codes = result.recordset.map((u) => u.short_code);
        await redisClient.sAdd(redisKey, codes);
        await redisClient.expire(redisKey, 3600); // 1 hour expiry
      }

      return result.recordset;
    } catch (err) {
      console.error("getUserUrls error:", err);
      throw err;
    }
  },
};
