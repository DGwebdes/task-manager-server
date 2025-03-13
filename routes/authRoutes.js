const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
const limiter = require("../middleware/limiter");
const { registerValidationRules } = require("../middleware/validationRules");
const validadeRequest = require("../middleware/validateRequest");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const authRouter = express.Router();

authRouter.post(
    "/register",
    registerValidationRules(),
    validadeRequest,
    async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                logger.warn("All fields are required", { email });
                return errorResponse(res, 400, "All fields are Required");
            }
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                logger.warn("User already exists", { email });
                return errorResponse(res, 400, "Email already used");
            }
            const newUser = new User({
                username,
                email,
                password,
            });
            await User.create(newUser);
            res.json({ message: "User created successfully." });
        } catch (err) {
            logger.error("Error creating user", { err });
            errorResponse(res, 500, "Error registering user", err.message);
        }
    }
);

authRouter.post("/login", limiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!email || !password) {
            logger.warn("All fields are required", { email });
            return errorResponse(res, 400, "All fields are Required");
        }
        if (!user) {
            logger.warn("User not found", { email });
            return errorResponse(res, 401, "Invalid email or password");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn("Invalid password", { email });
            return errorResponse(res, 401, "Invalid email or password");
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "2h",
        });
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login Successful",
            token,
            refreshToken,
            user,
        });
    } catch (err) {
        logger.error("Error logging in user", { err });
        errorResponse(res, 500, "Error logging in", err.message);
    }
});

authRouter.post("/refresh-token", limiter, async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        logger.warn("Refresh token is required", { refreshToken });
        return errorResponse(res, 401, "Refresh token is Required");
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            logger.warn("Invalid refresh token", { refreshToken });
            return errorResponse(res, 401, "Invalid refresh token");
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "2h" }
        );
        const newRefreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            message: "Access Token refreshed Successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        logger.error("Error refreshing token", { err });
        errorResponse(res, 500, "Error refreshing token", err.message);
    }
});

authRouter.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            logger.warn("User not found", { userId: req.user.userId });
            return errorResponse(res, 404, "User not Found");
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
        logger.error("Error updating profile", { err });
        errorResponse(res, 500, "Error updating profile", err.message);
    }
});

authRouter.delete("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            logger.warn("User not found", { userId: req.user.userId });
            return errorResponse(res, 404, "User not Found");
        }

        await user.deleteOne();
        res.status(200).json({ message: "Account deleted successfully." });
    } catch (err) {
        logger.error("Error deleting account", { err });
        errorResponse(res, 500, "Error deleting profile", err.message);
    }
});

module.exports = authRouter;
