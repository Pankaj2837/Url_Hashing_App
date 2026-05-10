const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { poolPromise } = require("./config/db.config");
const urlRoutes = require("./routes/url.routes");
const { connectRedis } = require("./config/redis.config");
const { getPoolForCode } = require("./config/sharding.config");
const { startSyncJob } = require("./services/sync.service");

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());
// 1. ADD THIS RIGHT HERE - BEFORE ANY OTHER ROUTES
app.get("/test-shard/:code", async (req, res) => {
  try {
    const { getPoolForCode } = require("./config/sharding.config");
    const { code } = req.params;
    const pool = await getPoolForCode(code);
    res.json({
      success: true,
      shard: pool.config.database,
      input: code,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 3. API Routes
app.use("/api/url", urlRoutes);

const PORT = process.env.PORT || 5000;

// 4. Start Server
const startServer = async () => {
  try {
    await connectRedis();
    await poolPromise;
    startSyncJob();
    console.log("⏲️ Analytics Sync Service Started");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // SAFE DEBUGGING: Only check routes after server is listening
      if (app._router && app._router.stack) {
        const routes = app._router.stack
          .filter((r) => r.route)
          .map((r) => r.route.path);
        console.log("Registered Routes:", routes);
      }
    });
  } catch (err) {
    console.error("Critical Startup Failure:", err);
  }
};

startServer();
