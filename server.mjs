// ------------------------------------------------------------------------
//                          Module Imports
// ------------------------------------------------------------------------

import express from "express";
import cors from "cors";
import path from "path";
import { writeFile, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import axios from "axios";

// ------------------------------------------------------------------------
//                      App Initialization
// ------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "./public/data/fakeData.json");

// ------------------------------------------------------------------------
//                      LowDB Initialization
// ------------------------------------------------------------------------

const adapter = new JSONFile("./public/data/data.json");
const db = new Low(adapter, { preferences: [] });

await db.read();

// ------------------------------------------------------------------------
//                      Middleware Setup
// ------------------------------------------------------------------------

app.use(cors());
app.use(express.json());

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

// Serve static assets (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------------------
//                      View Routes
// ------------------------------------------------------------------------

// Home Page Route
app.get("/", async (req, res) => {
  const categories = await getProductCategories();
  const firstCategoryProductList = await getProductsByCategory(categories[0]);
  const alertCounter = db.data.preferences.length;

  res.render("index", {
    categories,
    firstCategoryProductList,
    alertCounter,
  });
});

// ------------------------------------------------------------------------
//                      API Routes
// ------------------------------------------------------------------------

// Fetch products by category from FakeStore API
app.get("/api/fetch-category-product", async (req, res) => {
  const category = req.query.category;
  try {
    const { data } = await axios.get(
      `https://fakestoreapi.com/products/category/${category}`
    );
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.json([]);
  }
});

// Set a new price alert
app.post("/api/set-price-alert", async (req, res) => {
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
});

// Refresh product prices and check for matches
app.get("/api/refresh-fake-store-api", async (req, res) => {
  const priceAlerts = db.data.preferences || [];
  const allProducts = await fetchAndCacheProducts();
  let matches = 0;

  const evaluation = priceAlerts.map((alert) => {
    const product = allProducts.find((p) => p.id === alert.prdId);
    const currentPrice = product?.price || 0;
    const matched = currentPrice <= alert.prdPrice;

    if (matched) matches++;

    return {
      ...alert,
      currentPrice,
      match: matched,
    };
  });

  res.json({ evaluation, matches });
});

// ------------------------------------------------------------------------
//                      Helper Functions
// ------------------------------------------------------------------------

// Fetch all products and cache them to disk
async function fetchAndCacheProducts() {
  try {
    const { data } = await axios.get("https://fakestoreapi.com/products");
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("Products fetched and saved to file.");
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Get all product categories
async function getProductCategories() {
  try {
    const { data } = await axios.get("https://fakestoreapi.com/products/categories");
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

// ------------------------------------------------------------------------
//                      Start the Server
// ------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Running application on PORT: ${PORT}`);
});
