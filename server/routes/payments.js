import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  CLIENT_URL,
} from "../config.js";
import { getIo } from "../socket.js";

const router = Router();
const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-session
 * Creates a Stripe Checkout Session for an existing order.
 */
router.post("/create-session", requireAuth, async (req, res) => {
  const { orderId } = req.body;

  const order = db.orders.find((o) => o.id === Number(orderId));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  if (order.paymentStatus === "paid")
    return res.status(400).json({ error: "Order already paid" });
  if (new Date() > new Date(order.expiresAt))
    return res.status(400).json({ error: "Payment window expired" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "vnd",
        product_data: { name: item.name },
        unit_amount: item.priceSnapshot,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${CLIENT_URL}/orders?payment=success`,
    cancel_url: `${CLIENT_URL}/orders?payment=cancelled`,
    metadata: { orderId: String(order.id) },
  });

  res.json({ url: session.url });
});

/**
 * POST /api/payments/webhook
 * Receives Stripe webhook events and updates order payment status.
 */
router.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = Number(session.metadata.orderId);
    const order = db.orders.find((o) => o.id === orderId);
    if (order) {
      order.paymentStatus = "paid";
      order.paidAt = new Date().toISOString();
      getIo().emit("order:paid", { orderId });
    }
  }

  res.json({ received: true });
});

export default router;
