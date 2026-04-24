const BASE_URL = "/api";

async function doRequest(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  return res;
}

export async function request(endpoint, options = {}) {
  let res = await doRequest(endpoint, options);

  // Try to refresh access token once on 401
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        localStorage.setItem("accessToken", accessToken);
        res = await doRequest(endpoint, options);
      }
    }
  }

  if (!res.ok) {
    const data = await res.json();
    const error = new Error(data.error || "Something went wrong");
    error.email = data.email || null;
    throw error;
  }

  return res.json();
}
