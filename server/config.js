import "dotenv/config";

export const PORT = 3001;
export const JWT_SECRET = "shop_secret_key";
export const REFRESH_SECRET = "shop_refresh_secret";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
export const CLIENT_URL = "http://localhost:5173";
