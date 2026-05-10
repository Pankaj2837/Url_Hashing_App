import express from "express";
import cors from "cors";
import "dotenv/config";
import { poolPromise } from "./config/db.config.js";
import urlRoutes from "./routes/url.routes.js";
import { connectRedis } from "./config/redis.config.js";
import { getPoolForCode } from "./config/sharding.config.js";
import { startSyncJob } from "./services/sync.service.js";

const app = express();

// Allow Frontend to Access Backend APIs
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 1. Middleware
app.use(cors());
app.use(express.json());

// 3. API Routes
app.use("/api/url", urlRoutes);

const PORT = process.env.PORT || 5000;

// 4. Start Server
const startServer = async () => {
  try {
    await connectRedis();
    await poolPromise;
    startSyncJob();
    console.log("Analytics Sync Service Started");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Critical Startup Failure:", err);
  }
};

startServer();
