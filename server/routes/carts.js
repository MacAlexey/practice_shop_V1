import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * GET /api/cart
 * Returns the current user's cart.
 */
router.get("/", requireAuth, (req, res) => {
  let cart = db.carts.find((c) => c.userId === req.user.id);
  if (!cart) {
    cart = {
      id: Date.now(),
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };
    db.carts.push(cart);
  }
  res.json(cart);
});

/**
 * POST /api/cart/items
 * Adds a product to the cart or increases quantity if already exists.
 */
router.post("/items", requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId)
    return res.status(400).json({ error: "productId is required" });

  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (product.amount === 0)
    return res.status(400).json({ error: "Product is out of stock" });

  let cart = db.carts.find((c) => c.userId === req.user.id);
  if (!cart) {
    cart = {
      id: Date.now(),
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };
    db.carts.push(cart);
  }

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > 10)
      return res.status(400).json({ error: "Max quantity per item is 10" });
    if (newQty > product.amount)
      return res.status(400).json({ error: "Not enough stock" });
    cart.items = [
      { ...existing, quantity: newQty },
      ...cart.items.filter((i) => i.productId !== productId),
    ];
  } else {
    if (cart.items.length >= 50)
      return res.status(400).json({ error: "Your сart is full" });
    if (quantity > product.amount)
      return res.status(400).json({ error: "Not enough stock" });
    cart.items.unshift({
      productId,
      name: product.name,
      code: product.code,
      image: product.medias[0] || null,
      priceSnapshot: product.price,
      quantity,
    });
  }

  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

/**
 * PUT /api/cart/items/:productId
 * Updates the quantity of a cart item.
 */
router.put("/items/:productId", requireAuth, (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (!quantity || quantity < 1)
    return res.status(400).json({ error: "Quantity must be at least 1" });
  if (quantity > 10)
    return res.status(400).json({ error: "Max quantity per item is 10" });

  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (quantity > product.amount)
    return res.status(400).json({ error: "Not enough stock" });

  const cart = db.carts.find((c) => c.userId === req.user.id);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return res.status(404).json({ error: "Item not found in cart" });

  item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

/**
 * DELETE /api/cart/items/:productId
 * Removes a product from the cart.
 */
router.delete("/items/:productId", requireAuth, (req, res) => {
  const productId = Number(req.params.productId);

  const cart = db.carts.find((c) => c.userId === req.user.id);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const index = cart.items.findIndex((i) => i.productId === productId);
  if (index === -1)
    return res.status(404).json({ error: "Item not found in cart" });

  cart.items.splice(index, 1);
  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

/**
 * DELETE /api/cart
 * Clears all items from the cart.
 */
router.delete("/", requireAuth, (req, res) => {
  const cart = db.carts.find((c) => c.userId === req.user.id);
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  cart.items = [];
  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

export default router;
