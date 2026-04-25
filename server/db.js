/** In-memory storage — resets on server restart */
export const db = {
  users: [],
  nextUserId: 1,
  orders: [],
  nextOrderId: 1,
  refreshTokens: new Set(),
  otps: new Map(),
  products: [],
  nextProductId: 1,
};
