// One place for every request. The API address comes from client/.env (VITE_API_URL).
const BASE = import.meta.env.VITE_API_URL;
export const TOKEN_KEY = "ow_admin_token";

export async function http(path, { method = "GET", body, auth = false, form = false } = {}) {
  const headers = {};
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body && !form) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? (form ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event("admin-unauthorized"));
    throw new Error(data?.message || "Something went wrong");
  }
  return data;
}

export const qs = (o = {}) => {
  const s = new URLSearchParams(Object.entries(o).filter(([, v]) => v !== "" && v != null)).toString();
  return s ? `?${s}` : "";
};
