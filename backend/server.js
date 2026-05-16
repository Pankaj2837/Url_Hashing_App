import express from "express";
import cors from "cors";
import "dotenv/config";
import { ensureDatabaseExists, getAppPool } from "./config/db.js";
import urlRoutes from "./routes/url.routes.js";
import { connectRedis } from "./config/redis.config.js";
import { startSyncJob } from "./services/sync.service.js";

const app = express();

// 1. Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost",
      "http://frontend-app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

// 2. API Routes
app.use("/api/url", urlRoutes);

const PORT = process.env.PORT || 5000;

// 3. Start Server Logic
const startServer = async () => {
  try {
    // Phase 1 & 2: Connect to Master, Check/Create UrlShortenerDB
    await ensureDatabaseExists();

    // Phase 3: Switch context to UrlShortenerDB
    const pool = await getAppPool();
    console.log("✔ Connected to UrlShortenerDB context.");

    // Start other services
    await connectRedis();
    startSyncJob();
    console.log("✔ Analytics Sync Service Started");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical Startup Failure:", err);
    process.exit(1); // Exit if DB cannot be initialized
  }
};

startServer();
