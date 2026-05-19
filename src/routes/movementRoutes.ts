import express from "express";
import * as MovementsController from "../controllers/movements/MovementsController.js";

const movementRoutes = express.Router();

movementRoutes.post("/register/:userId", MovementsController.RegisterMovement);
movementRoutes.get("/list", MovementsController.GetMovements);

export default movementRoutes;