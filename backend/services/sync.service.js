const cron = require("node-cron");
const { redisClient } = require("../config/redis.config");
const sql = require("mssql");
const { poolPromise } = require("../config/db.config");

const syncClicksToDb = async () => {
  try {
    console.log("🔄 Syncing analytics to SQL Server...");
    const pool = await poolPromise;

    // 1. Find all keys that look like 'clicks:*'
    const keys = await redisClient.keys("clicks:*");

    for (const key of keys) {
      const shortCode = key.split(":")[1];
      const clickCount = await redisClient.get(key);

      if (clickCount > 0) {
        // 2. Perform a Batch Update in SQL
        // This updates the 'clicks' column by adding the new clicks
        await pool
          .request()
          .input("shortCode", sql.VarChar, shortCode)
          .input("count", sql.Int, parseInt(clickCount)).query(`
                        UPDATE URLs 
                        SET clicks = clicks + @count 
                        WHERE short_code = @shortCode
                    `);

        // 3. Reset the counter in Redis for the next interval
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

module.exports = { startSyncJob, syncClicksToDb };
