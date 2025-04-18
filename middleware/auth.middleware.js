const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../model/User.model");
require("dotenv").config();
// Middleware for Check is user authenticated or not ?
exports.isAuthenticated = asyncHandler(async (req, res, next) => {
    // Get Token
    const token =
        req.body?.token ||
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.cookies?.token;
    // If Not Token Then Unauthorised
    if (!token) {
        return res.error("Token Missing", 401);
    }
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.error("Invalid Token !", 401);
    }

    // check is token is valid Or Not ? If Not Then Error
});
// Middleware for check is user is admin Or someone else if admin then go to next controller
exports.isAdmin = asyncHandler(async (req, res, next) => {
    const user = req?.user ?? null;

    // Step 1: Check if token attached user info
    if (!user) {
        return res.error("Unauthorized access. User not authenticated.", 401);
    }

    // Step 2: Check token claims admin access
    if (!user.isAdmin) {
        return res.error("Access denied. Admins only.", 403);
    }

    // Step 3: Get latest user details from DB
    const userDetails = await User.findById(user._id);

    // Step 4: Handle user not found
    if (!userDetails) {
        return res.error("User not found", 404);
    }

    // Step 5: Double-check role and admin flag

    if (userDetails.role !== "admin" || !userDetails.isAdmin) {
        return res.error("User role can't be verified", 403);
    }

    // All good — move to next handler
    next();
});

// Middleware for check is user is Customer(user) Or someone else if Customer(user) then go to next controller
exports.isUser = asyncHandler(async (req, res, next) => {
    const user = req?.user ?? null;

    // Step 1: Check if token attached user info
    if (!user) {
        return res.error("Unauthorized access. User not authenticated.", 401);
    }

    // Step 2: Check token claims user access or not ?
    if (user.role !== "user") {
        return res.error("Access denied. User only.", 403);
    }
    // Step 3: Get latest user details from DB
    const userDetails = await User.findById(user._id);

    // Step 4: Handle user not found
    if (!userDetails) {
        return res.error("User not found", 404);
    }
    // Step 5: Double-check role and admin flag
    if (userDetails.role !== user.role) {
        return res.error("User role can't be verified", 403);
    }

    // All Good
    next();
});
