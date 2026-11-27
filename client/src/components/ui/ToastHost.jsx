import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mounted once in main.jsx.
export default function ToastHost() {
  return <ToastContainer position="top-right" theme="dark" autoClose={3500} newestOnTop closeOnClick pauseOnFocusLoss={false} />;
}
