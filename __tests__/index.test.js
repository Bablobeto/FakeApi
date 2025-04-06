import request from "supertest";
import express from "express";
import route from "../routes/index.js";

const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "public/views");
app.use("/", route);

// Tests
describe("FakeApiController Routes", () => {
  it("GET / should render homepage with EJS", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/<!DOCTYPE html>/);
  });

  it("POST /api/set-price-alert should save or update alert", async () => {
    const data = {
      prdId: 99,
      prdTitle: "Sample Product",
      prdImage: "https://example.com/image.png",
      prdPrice: 20.0,
    };

    const res = await request(app).post("/api/set-price-alert").send(data);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/success/i);
    expect(res.body.data.prdId).toBe(data.prdId);
  });

  it("GET /api/fetch-category-product should return products", async () => {
    const category = "electronics";
    const res = await request(app).get(
      `/api/fetch-category-product?category=${category}`
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/refresh-fake-store-api should return evaluated alerts", async () => {
    const res = await request(app).get("/api/refresh-fake-store-api");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("evaluation");
    expect(res.body).toHaveProperty("matches");
  });
});
