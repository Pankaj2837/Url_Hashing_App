const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { shorten, redirect } = require("../controllers/url.controller");
const { protect } = require("../middleware/auth.middleware");
const apiLimiter = require("../middleware/rateLimiter");
const { getPoolForCode } = require("../config/sharding.config"); // Import this

// Auth Routes
router.post("/register", register);
router.post("/login", login);

// URL Routes
router.post("/shorten", protect, apiLimiter, shorten);

// The "Catch-All" route MUST be last
router.get("/:shortCode", redirect);

module.exports = router;
