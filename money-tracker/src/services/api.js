/**
 * Centralised requests to the Money Tracker API.
 * The API URL is public configuration; never place passwords or private keys here.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || "http://localhost:5000/api").replace(/\/+$/, "");

function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

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
      credentials: "include",
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_BASE_URL}. Check the API URL and confirm that the Render service is running.`);
  }
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json().catch(() => ({})) : {};
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
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST", body: JSON.stringify({}) }),
};

export const transactionApi = {
  list: (params = {}) => apiRequest(`/transactions${queryString(params)}`),
  get: (id) => apiRequest(`/transactions/${encodeURIComponent(id)}`),
  create: (data) => apiRequest("/transactions", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE" }),
  importMpesaMessage: (message, accountId) => apiRequest("/transactions/import-mpesa", { method: "POST", body: JSON.stringify({ message, ...(accountId ? { accountId } : {}) }) }),
  summary: (params = {}) => apiRequest(`/transactions/summary${queryString(params)}`),
};

export const accountApi = {
  list: () => apiRequest("/accounts"),
  balances: () => apiRequest("/accounts/balances"),
  create: (data) => apiRequest("/accounts", { method: "POST", body: JSON.stringify(data) }),
};

export const categoryApi = {
  list: (type) => apiRequest(`/categories${queryString({ type })}`),
  create: (data) => apiRequest("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/categories/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const budgetApi = {
  list: (period) => apiRequest(`/budgets${queryString({ period })}`),
  getProgress: (period) => apiRequest(`/budgets/progress${queryString({ period })}`),
  create: (data) => apiRequest("/budgets", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/budgets/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/budgets/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const insightApi = { summary: () => apiRequest("/insights") };
