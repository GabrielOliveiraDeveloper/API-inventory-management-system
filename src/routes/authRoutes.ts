import express from "express";
import LoginController from "../controllers/auth/LoginController.js";
import RegisterController from "../controllers/auth/RegisterController.js";
const authRoutes = express.Router();

authRoutes.post("/login", LoginController);
authRoutes.post("/register", RegisterController);

export default authRoutes;