/**
 * One place for requests to the Money Tracker backend.
 * Set VITE_API_URL in your environment files; do not put secrets here.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...options,
      headers,
      credentials: "include", // Required for the backend's HTTP-only auth cookie.
    });
  } catch {
    throw new Error(
      `Cannot reach the backend at ${API_BASE_URL}. Check the API URL and confirm that the Render service is running.`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    const error = new Error(body.message || body.error || `Request failed (${response.status}).`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const authApi = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiRequest("/auth/me", { method: "GET" }),
  logout: () => apiRequest("/auth/logout", { method: "POST", body: JSON.stringify({}) }),
};

export const transactionApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/transactions${query ? `?${query}` : ""}`);
  },
  create: (data) => apiRequest("/transactions", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE" }),
  importMpesaMessage: (message) => apiRequest("/transactions/import-mpesa", { method: "POST", body: JSON.stringify({ message }) }),
};

export const accountApi = {
  list: () => apiRequest("/accounts"),
  balances: () => apiRequest("/accounts/balances"),
  create: (data) => apiRequest("/accounts", { method: "POST", body: JSON.stringify(data) }),
};

export const budgetApi = {
  list: () => apiRequest("/budgets"),
  create: (data) => apiRequest("/budgets", { method: "POST", body: JSON.stringify(data) }),
};

export const insightApi = {
  summary: () => apiRequest("/insights"),
};
