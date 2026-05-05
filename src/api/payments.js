import { request } from "./client.js";

export function createPaymentSession(orderId) {
  return request("/payments/create-session", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
