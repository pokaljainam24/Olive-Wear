import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/global.css";
import App from "./App.jsx";
import { AuthProvider } from "./admin/AuthContext";
import { ConfirmProvider } from "./components/ui/ConfirmProvider";
import { CartProvider } from "./components/CartContext";
import ToastHost from "./components/ui/ToastHost";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <CartProvider>
            <App />
            <ToastHost />
          </CartProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
