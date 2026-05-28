import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { STRIPE_SECRET_KEY } from "../config.js";

const stripe = new Stripe(STRIPE_SECRET_KEY);

const router = Router();

/**
 * POST /api/reports/:id/refund
 * Issues a Stripe refund for the order linked to the report.
 */
// TODO: replace requireAuth with requireAdmin middleware once admin roles are implemented
router.post("/:id/refund", requireAuth, async (req, res) => {
  const report = db.reports.find((r) => r.id === Number(req.params.id));
  if (!report) return res.status(404).json({ error: "Report not found" });

  const order = db.orders.find((o) => o.id === report.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!order.stripePaymentIntentId)
    return res.status(400).json({ error: "No payment intent found for this order" });

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });
    order.paymentStatus = "refunded";
    report.status = "resolved";
    res.json({ refundId: refund.id, status: refund.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/reports
 * Creates a report for a paid order.
 */
router.post("/", requireAuth, (req, res) => {
  const { orderId, reason, description } = req.body;

  if (!orderId || !reason)
    return res.status(400).json({ error: "orderId and reason are required" });

  const order = db.orders.find((o) => o.id === Number(orderId));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  if (order.paymentStatus !== "paid")
    return res.status(400).json({ error: "Can only report paid orders" });

  const report = {
    id: db.nextReportId++,
    orderId: Number(orderId),
    userId: req.user.id,
    reason,
    description: description || "",
    status: "open",
    createdAt: new Date().toISOString(),
  };

  db.reports.push(report);
  res.status(201).json(report);
});

export default router;
