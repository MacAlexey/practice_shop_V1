import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * GET /api/products
 * Returns all products.
 */
router.get("/", (req, res) => {
  res.json(db.products);
});

/**
 * GET /api/products/:id
 * Returns a single product by ID.
 */
router.get("/:id", (req, res) => {
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/**
 * POST /api/products
 * Creates a new product.
 */
router.post("/", requireAuth, (req, res) => {
  const { name, code, medias, price, amount } = req.body;

  if (!name || !code || price == null || amount == null) {
    return res
      .status(400)
      .json({ error: "name, code, price and amount are required" });
  }

  const product = {
    id: db.nextProductId++,
    name,
    code,
    medias: medias || [],
    price,
    amount,
  };

  db.products.push(product);
  res.status(201).json(product);
});

/**
 * PUT /api/products/:id
 * Updates a product by ID.
 */
router.put("/:id", requireAuth, (req, res) => {
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { name, code, medias, price, amount } = req.body;
  if (name != null) product.name = name;
  if (code != null) product.code = code;
  if (medias != null) product.medias = medias;
  if (price != null) product.price = price;
  if (amount != null) product.amount = amount;

  res.json(product);
});

/**
 * DELETE /api/products/:id
 * Deletes a product by ID.
 */
router.delete("/:id", requireAuth, (req, res) => {
  const index = db.products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  db.products.splice(index, 1);
  res.json({ message: "Product deleted" });
});

export default router;
