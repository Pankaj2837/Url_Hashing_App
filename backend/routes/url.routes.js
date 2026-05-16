import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { shorten, redirect, getMyUrls } from "../controllers/url.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import apiLimiter from "../middleware/rateLimiter.js";
import { getPoolForCode } from "../config/sharding.config.js";

const router = express.Router();
// Auth Routes
router.post("/register", register);
router.post("/login", login);

// URL Routes
// router.post("/shorten", protect, apiLimiter, shorten);
router.post("/shorten", protect, shorten);

router.get("/my-urls", protect, getMyUrls);

router.get("/:shortCode", redirect);

export default router;
