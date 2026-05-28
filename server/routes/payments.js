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
import { CURRENCY_VND } from "../constants.js";

const router = Router();
const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-session
 * Creates a Stripe Checkout Session for an existing order.
 */
router.post("/create-session", requireAuth, async (req, res) => {
  const { orderId, couponCode } = req.body;

  const order = db.orders.find((o) => o.id === Number(orderId));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  if (order.paymentStatus === "paid")
    return res.status(400).json({ error: "Order already paid" });
  if (new Date() > new Date(order.expiresAt))
    return res.status(400).json({ error: "Payment window expired" });

  const coupon = couponCode
    ? db.coupons.find((c) => c.code === couponCode)
    : null;
  if (couponCode && !coupon)
    return res.status(400).json({ error: "Invalid coupon code" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: order.items.map((item) => ({
      price_data: {
        currency: CURRENCY_VND,
        product_data: { name: item.name },
        unit_amount: item.priceSnapshot,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${CLIENT_URL}/orders?payment=success`,
    cancel_url: `${CLIENT_URL}/orders?payment=cancelled`,
    metadata: { orderId: String(order.id) },
    invoice_creation: { enabled: true },
    ...(coupon && { discounts: [{ coupon: coupon.stripeCouponId }] }),
  });

  res.json({ url: session.url });
});

/**
 * GET /api/payments/invoice/:orderId
 * Returns the Stripe invoice PDF URL for a paid order.
 */
router.get("/invoice/:orderId", requireAuth, async (req, res) => {
  const order = db.orders.find((o) => o.id === Number(req.params.orderId));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  if (!order.stripeInvoiceId)
    return res.status(404).json({ error: "Invoice not available" });

  try {
    const invoice = await stripe.invoices.retrieve(order.stripeInvoiceId);
    res.json({ url: invoice.invoice_pdf });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve invoice" });
  }
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
      order.stripeInvoiceId = session.invoice;
      order.stripePaymentIntentId = session.payment_intent;

      getIo().to(`user:${order.userId}`).emit("order:paid", { orderId });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = Number(session.metadata.orderId);
    const order = db.orders.find((o) => o.id === orderId);
    if (order && order.paymentStatus === "unpaid") {
      order.paymentStatus = "expired";
      order.items.forEach((item) => {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.amount += item.quantity;
      });
      if (order.userId) {
        getIo().to(`user:${order.userId}`).emit("order:expired", { orderId });
      }
    }
  }

  res.json({ received: true });
});

export default router;
