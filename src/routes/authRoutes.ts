import express from "express";
import LoginController from "../controllers/auth/LoginController.js";
import RegisterController from "../controllers/auth/RegisterController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
const authRoutes = express.Router();

authRoutes.post("/login", LoginController);
authRoutes.post("/register", AuthMiddleware, RegisterController);

export default authRoutes;