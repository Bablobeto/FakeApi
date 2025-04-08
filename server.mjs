import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import process from "node:process";
import logger from "./logger.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

// Routes
// Api
app.use("/", routes);

// Error handling
app.use(errorHandler);

// Logs real-time memory usage.
setInterval(() => {
  const mem = process.memoryUsage();
  console.log({
    rss: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB",
    heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + " MB",
  });
}, 5000);


process.on('uncaughtException', (error) => {
    logger.error(error);
    process.exit(1);
});


import { StatsD } from "hot-shots";
const dogstatsd = new StatsD();

// Increment a counter.
dogstatsd.increment('page.views')

// Server start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
