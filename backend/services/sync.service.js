import cron from "node-cron";
import { redisClient } from "../config/redis.config.js";
import sql from "mssql";
import { poolPromise } from "../config/db.config.js";

const syncClicksToDb = async () => {
  try {
    console.log("🔄 Syncing analytics to SQL Server...");
    const pool = await poolPromise;

    const keys = await redisClient.keys("clicks:*");

    for (const key of keys) {
      const shortCode = key.split(":")[1];
      const clickCount = await redisClient.get(key);

      if (clickCount > 0) {
        await pool
          .request()
          .input("shortCode", sql.VarChar, shortCode)
          .input("count", sql.Int, parseInt(clickCount)).query(`
                        UPDATE URLs 
                        SET clicks = clicks + @count 
                        WHERE short_code = @shortCode
                    `);

        await redisClient.set(key, 0);
      }
    }
    console.log("✅ Sync Complete.");
  } catch (err) {
    console.error("❌ Sync Error:", err);
  }
};

// Schedule to run every 5 minutes
const startSyncJob = () => {
  cron.schedule("*/5 * * * *", syncClicksToDb);
};

export { startSyncJob, syncClicksToDb };
