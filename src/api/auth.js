import { request } from "./client";

export function register(data) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refreshToken() {
  const token = localStorage.getItem("refreshToken");
  return request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
}

export function logout() {
  const token = localStorage.getItem("refreshToken");
  return request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
}

export function verifyOtp(data) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
