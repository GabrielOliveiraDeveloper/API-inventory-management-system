import express from "express";
import LoginController from "../controllers/auth/LoginController.js";
import RegisterController from "../controllers/auth/RegisterController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import requireRole from '../middlewares/RoleMiddleware.js';
import { authLimiter } from '../middlewares/RateLimiter.js';

const authRoutes = express.Router();

authRoutes.post("/login", authLimiter, LoginController);
authRoutes.post("/register", AuthMiddleware, requireRole('admin'), RegisterController);

export default authRoutes;