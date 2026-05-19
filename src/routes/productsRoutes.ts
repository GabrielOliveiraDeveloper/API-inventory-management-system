import * as ProductsController from "../controllers/products/ProductsController.js";
import express from "express";

const productsRoutes = express.Router();

productsRoutes.post("/create", ProductsController.CreateProduct);
productsRoutes.get("/list", ProductsController.GetProducts);
productsRoutes.put("/update/:id", ProductsController.UpdateProduct);

export default productsRoutes;