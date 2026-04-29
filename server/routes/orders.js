import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { JWT_SECRET } from "../config.js";

const router = Router();

/**
 * GET /api/orders
 * Returns orders for the authenticated user, or an empty array for guests.
 */
router.get("/", (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.json([]);

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userOrders = db.orders.filter((o) => o.userId === decoded.id);
    res.json(userOrders);
  } catch {
    res.json([]);
  }
});

/**
 * POST /api/orders
 * Creates a new order. Works for both authenticated users and guests.
 */
router.post("/", (req, res) => {
  const { name, email, address, items, totalPrice } = req.body;

  const header = req.headers.authorization;
  let userId = null;
  let userName = name;
  let userEmail = email;

  if (header) {
    try {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
      userName = decoded.name;
      userEmail = decoded.email;
    } catch {}
  }

  if (!userName || !userEmail || !address || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all fields and add items to cart" });
  }

  const order = {
    id: db.nextOrderId++,
    userId,
    name: userName,
    email: userEmail,
    address,
    items,
    totalPrice,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  items.forEach((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (product) product.amount = Math.max(0, product.amount - item.quantity);
  });

  db.orders.push(order);
  res.status(201).json(order);
});

/**
 * GET /api/orders/:id
 * Returns a single order by ID. Only accessible by the order owner.
 */
router.get("/:id", requireAuth, (req, res) => {
  const order = db.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  res.json(order);
});

export default router;
