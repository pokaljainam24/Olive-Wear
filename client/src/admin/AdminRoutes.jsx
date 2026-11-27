import { Routes, Route, Navigate } from "react-router-dom";
import "../styles/admin.css";
import RequireAuth from "./RequireAuth";
import AdminLayout from "./AdminLayout";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Products from "./Products";
import ProductForm from "./ProductForm";
import Categories from "./Categories";
import Cms from "./Cms";
import Inventory from "./Inventory";
import Queries from "./Queries";
import Orders from "./Orders";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="cms" element={<Cms />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="queries" element={<Queries />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
