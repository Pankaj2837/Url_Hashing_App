import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { shorten, redirect, getMyUrls } from "../controllers/url.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import apiLimiter from "../middleware/rateLimiter.js";
import { getPoolForCode } from "../config/sharding.config.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/shorten", protect, apiLimiter, shorten);
// For Load Testing
// router.post("/shorten", protect, shorten);

router.get("/my-urls", protect, getMyUrls);

router.get("/:shortCode", redirect);

export default router;
