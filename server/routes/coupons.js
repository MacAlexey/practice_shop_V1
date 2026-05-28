import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { STRIPE_SECRET_KEY } from "../config.js";
import { CURRENCY_VND } from "../constants.js";

const stripe = new Stripe(STRIPE_SECRET_KEY);
const router = Router();

/**
 * POST /api/coupons
 * Creates a coupon in Stripe and saves it locally.
 */
// TODO: replace requireAuth with requireAdmin middleware once admin roles are implemented
router.post("/", requireAuth, async (req, res) => {
  const { code, discountType, discountValue } = req.body;

  if (!code || !discountType || !discountValue)
    return res.status(400).json({ error: "code, discountType and discountValue are required" });
  if (!["percent", "fixed"].includes(discountType))
    return res.status(400).json({ error: "discountType must be 'percent' or 'fixed'" });

  try {
    const stripeCoupon = await stripe.coupons.create(
      discountType === "percent"
        ? { percent_off: discountValue, duration: "once" }
        : { amount_off: discountValue, currency: CURRENCY_VND, duration: "once" }
    );

    const promoCode = await stripe.promotionCodes.create({
      coupon: stripeCoupon.id,
      code,
    });

    const coupon = {
      code,
      discountType,
      discountValue,
      stripeCouponId: stripeCoupon.id,
      stripePromoCodeId: promoCode.id,
      createdAt: new Date().toISOString(),
    };

    db.coupons.push(coupon);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/coupons
 * Returns all coupons.
 */
router.get("/", requireAuth, (req, res) => {
  res.json(db.coupons);
});

/**
 * DELETE /api/coupons/:code
 * Deletes a coupon from Stripe and locally.
 */
// TODO: replace requireAuth with requireAdmin middleware once admin roles are implemented
router.delete("/:code", requireAuth, async (req, res) => {
  const index = db.coupons.findIndex((c) => c.code === req.params.code);
  if (index === -1) return res.status(404).json({ error: "Coupon not found" });

  const coupon = db.coupons[index];

  try {
    await stripe.promotionCodes.update(coupon.stripePromoCodeId, { active: false });
    await stripe.coupons.del(coupon.stripeCouponId);
    db.coupons.splice(index, 1);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
