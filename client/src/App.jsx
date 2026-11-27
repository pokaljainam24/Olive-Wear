import { useState, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Cursor from "./components/Cursor";
import Intro from "./components/Intro";
import ScrollToTop from "./components/ScrollToTop";
import PageHeader from "./components/PageHeader";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ContentPage from "./pages/ContentPage";
import Lookbook from "./pages/Lookbook";
import AdminRoutes from "./admin/AdminRoutes";
import useScrollEffects from "./hooks/useScrollEffects";

function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" text="The page you are looking for does not exist." />
      <div className="text-center pb-5">
        <Link to="/" className="btn btn-olive px-4">Back to home</Link>
      </div>
    </>
  );
}

export default function App() {
  useScrollEffects();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const [intro, setIntro] = useState(() => !window.location.pathname.startsWith("/admin"));
  const finishIntro = useCallback(() => {
    document.documentElement.classList.add("intro-done");
    setIntro(false);
  }, []);

  if (isAdmin) return <AdminRoutes />;

  return (
    <>
      {intro && <Intro onDone={finishIntro} />}
      <Cursor />
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route path="/terms" element={<ContentPage type="policy" pageKey="terms" />} />
          <Route path="/privacy" element={<ContentPage type="policy" pageKey="privacy" />} />
          <Route path="/shipping" element={<ContentPage type="policy" pageKey="shipping" />} />
          <Route path="/returns" element={<ContentPage type="policy" pageKey="returns" />} />
          <Route path="/size-guide" element={<ContentPage type="sizeguide" pageKey="size-guide" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
