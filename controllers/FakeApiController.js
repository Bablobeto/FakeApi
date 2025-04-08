import axios from "axios";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { db } from "../data/lowdbInstance.js";
import logger from "../logger.js";

const DATA_FILE = path.join(process.cwd(), "data/fakeData.json");
const DATA_FILE_CATEGORIES = path.join(
  process.cwd(),
  "data/fakeDataCategories.json"
);

export async function index(req, res, next) {
  try {
    const alertCounter = db.data.preferences.length;

    // Pull from fake store api and store locally
    refreshData();

    // Read data from file
    const fakeData = await readFile(DATA_FILE, "utf-8");
    const productsFromFile = JSON.parse(fakeData);

    // Read categories from file
    const fakeCategories = await readFile(DATA_FILE_CATEGORIES, "utf-8");
    const categoriesFromFile = JSON.parse(fakeCategories);

    res.render("index", {
      categoriesFromFile,
      productsFromFile,
      alertCounter,
    });
  } catch (err) {
    logger.info('Error launching the application',{color: 'red' });
    next(err);
  }
}

export async function setPriceAlert(req, res, next) {
  try {
    const data = req.body;
    const index = db.data.preferences.findIndex(
      (item) => item.prdId === data.prdId
    );

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
    logger.info('Error setting price alert',{color: 'red' });
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

export async function refreshData(req, res) {
  try {
    const priceAlerts = db.data.preferences || [];
    const response = await axios.get("https://fakestoreapi.com/products");
    const data = response.data;

    if (data.length > 0) {
      const uniqueCategories = [...new Set(data.map((p) => p.category))];

      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      await writeFile(
        DATA_FILE_CATEGORIES,
        JSON.stringify(uniqueCategories, null, 2),
        "utf-8"
      );

      let matches = 0;
      const evaluation = priceAlerts.map((alert) => {
        const matchProduct = data.find((p) => p.id === alert.prdId);
        const currentPrice = matchProduct?.price || 0;

        if (currentPrice <= alert.prdPrice) matches++;
        return {
          ...alert,
          currentPrice,
          match: currentPrice <= alert.prdPrice,
        };
      });

      res.json({ evaluation, matches });
    }
  } catch (err) {
    logger.info('Error refreshing data',{color: 'red' });
  }
}

// Utils functions
// Get all product categories
async function getProductCategories() {
  try {
    const { data } = await axios.get(
      "https://fakestoreapi.com/products/categories"
    );
    await writeFile(
      DATA_FILE_CATEGORIES,
      JSON.stringify(data, null, 2),
      "utf-8"
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
