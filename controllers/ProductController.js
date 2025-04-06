import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";
import { db } from "../data/lowdbInstance.js";

const DATA_FILE = path.join(process.cwd(), "data/fakeData.json");

export async function index(req, res, next) {
  try {
    const categories = await getProductCategories();
    const firstCategoryProductList = await getProductsByCategory(categories[0]);
    const alertCounter = db.data.preferences.length;

    res.render("index", {
      categories,
      firstCategoryProductList,
      alertCounter,
    });
  } catch (err) {
    next(err);
  }
}

export async function setPriceAlert(req, res, next) {
  try {
    const data = req.body;
    const index = db.data.preferences.findIndex((item) => item.prdId === data.prdId);
  
    if (index === -1) {
      db.data.preferences.push(data);
    } else {
      db.data.preferences[index] = { ...db.data.preferences[index], ...data };
    }
  
    await db.write();
  
    res.json({
      message: "Price alert set successfully",
      data,
      total: db.data.preferences.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryProducts(req, res, next) {
  try {
    const category = req.query.category;
    const response = await axios.get(
      `https://fakestoreapi.com/products/category/${category}`
    );
    res.json(response.data || []);
  } catch (error) {
    next(error);
  }
}

export async function refreshData(req, res, next) {
  try {
    const priceAlerts = db.data.preferences || [];
    const response = await axios.get("https://fakestoreapi.com/products");
    const data = response.data;

    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");

    let matches = 0;
    const evaluation = priceAlerts.map((alert) => {
      const matchProduct = data.find((p) => p.id === alert.prdId);
      const currentPrice = matchProduct?.price || 0;

      if (currentPrice <= alert.prdPrice) matches++;
      return { ...alert, currentPrice, match: currentPrice <= alert.prdPrice };
    });

    res.json({ evaluation, matches });
  } catch (err) {
    next(err);
  }
}

// Utils functions
// Get all product categories
async function getProductCategories() {
  try {
    const { data } = await axios.get(
      "https://fakestoreapi.com/products/categories"
    );
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch products for the first category
async function getProductsByCategory(category) {
  try {
    const { data } = await axios.get(
      `https://fakestoreapi.com/products/category/${category}`
    );
    return data || [];
  } catch (error) {
    console.error(`Error fetching products for category: ${category}`, error);
    return [];
  }
}
