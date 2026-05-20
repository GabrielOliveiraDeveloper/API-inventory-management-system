import express from "express";
import * as MovementsController from "../controllers/movements/MovementsController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
const movementRoutes = express.Router();

movementRoutes.post("/register/:userId", AuthMiddleware, MovementsController.RegisterMovement);
movementRoutes.get("/", AuthMiddleware, MovementsController.GetMovements);

export default movementRoutes;