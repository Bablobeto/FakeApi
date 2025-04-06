import express from "express";
import { index, setPriceAlert, getCategoryProducts, refreshData } from "../controllers/FakeApiController.js";

const route = express.Router();

route.get("/", index);
route.post("/api/set-price-alert", setPriceAlert);
route.get("/api/fetch-category-product", getCategoryProducts);
route.get("/api/refresh-fake-store-api", refreshData);

export default route;
