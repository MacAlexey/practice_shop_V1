import { request } from "./client.js";

export function createReport(data) {
  return request("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
