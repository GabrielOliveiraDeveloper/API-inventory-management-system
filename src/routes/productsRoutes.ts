import * as ProductsController from "../controllers/products/ProductsController.js";
import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

const productsRoutes = express.Router();

productsRoutes.post("/create", AuthMiddleware, ProductsController.CreateProduct);
productsRoutes.get("/list", AuthMiddleware, ProductsController.GetProducts);
productsRoutes.put("/update/:id", AuthMiddleware, ProductsController.UpdateProduct);
productsRoutes.delete("/delete/:id", AuthMiddleware, ProductsController.RemoveProduct);

export default productsRoutes;