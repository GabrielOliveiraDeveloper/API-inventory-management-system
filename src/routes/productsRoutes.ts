import * as ProductsController from "../controllers/products/ProductsController.js";
import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import requireRole from '../middlewares/Rolemiddleware.js';

const productsRoutes = express.Router();

productsRoutes.post("/create", AuthMiddleware, requireRole('admin'), ProductsController.CreateProduct);
productsRoutes.get("/list", AuthMiddleware, ProductsController.GetProducts);
productsRoutes.put("/update/:id", AuthMiddleware, requireRole('admin'), ProductsController.UpdateProduct);
productsRoutes.delete("/delete/:id", AuthMiddleware, requireRole('admin'), ProductsController.RemoveProduct);

export default productsRoutes;