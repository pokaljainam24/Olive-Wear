import { http, qs } from "./http";

const crud = (base) => ({
  list: (p) => http(`${base}${qs(p)}`, { auth: true }),
  get: (id) => http(`${base}/${id}`, { auth: true }),
  create: (body) => http(base, { method: "POST", body, auth: true }),
  update: (id, body) => http(`${base}/${id}`, { method: "PUT", body, auth: true }),
  remove: (id) => http(`${base}/${id}`, { method: "DELETE", auth: true }),
});

const file = (path, field, f) => {
  const fd = new FormData();
  fd.append(field, f);
  return http(path, { method: "POST", body: fd, auth: true, form: true });
};

export const adminApi = {
  login: (body) => http("/auth/login", { method: "POST", body }),
  me: () => http("/auth/me", { auth: true }),
  dashboard: () => http("/admin/dashboard", { auth: true }),
  upload: (f) => file("/admin/upload", "image", f),
  bulkProducts: (f) => file("/admin/products/bulk", "file", f),
  sampleCsv: () => http("/admin/products/bulk/sample", { auth: true }),
  products: crud("/admin/products"),
  categories: crud("/admin/categories"),
  content: crud("/admin/content"),
  queries: crud("/admin/queries"),
  orders: {
    list: () => http("/admin/orders", { auth: true }),
    updateTracking: (id, body) => http(`/admin/orders/${id}/tracking`, { method: "PUT", body, auth: true }),
  },
  inventory: {
    ...crud("/admin/inventory"),
    locations: () => http("/admin/inventory/locations", { auth: true }),
  },
};
