import { PRODUCTS } from "../src/data/products.js";

/** In-memory storage — resets on server restart */
export const db = {
  users: [],
  nextUserId: 1,
  orders: [],
  nextOrderId: 1,
  refreshTokens: new Set(),
  otps: new Map(),
  // products: [],  - will be main data source for products
  products: PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.name.toLowerCase().replace(/\s+/g, "-"),
    medias: [p.image],
    price: p.price,
    amount: p.amount,
  })),
  nextProductId: PRODUCTS.length + 1,
  carts: [],
};
