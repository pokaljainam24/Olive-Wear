import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { shopApi } from "../api/shop";
import useFetch from "../hooks/useFetch";
import { getViews } from "../utils/views";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import SafeImage from "../components/SafeImage";
import SectionTitle from "../components/SectionTitle";
import ProductGrid from "../components/ProductGrid";
import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";
import { useCart } from "../components/CartContext";

const stockOf = (p, color, size) => p.stock?.[color]?.[size] || 0;

// first colour/size that is in stock
const firstAvailable = (p) => {
  for (let c = 0; c < p.colors.length; c++) {
    for (const s of p.sizes) if (stockOf(p, p.colors[c].name, s) > 0) return { c, s };
  }
  return { c: 0, s: p.sizes[0] || "" };
};

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(() => shopApi.product(id), [id]);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const [busy, setBusy] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!product) return;
    const first = firstAvailable(product);
    setColor(first.c);
    setSize(first.s);
    setQty(stockOf(product, product.colors[first.c]?.name, first.s) > 0 ? 1 : 0);
    setView(0);
  }, [product]);

  if (loading) return <div className="page-top container"><Loader /></div>;
  if (error || !product) {
    return (
      <>
        <PageHeader title="Product not found" text={error || "This item is no longer available."} />
        <div className="text-center pb-5"><Link to="/#shop" className="btn btn-olive px-4">Back to shop</Link></div>
      </>
    );
  }

  const colorName = product.colors[color]?.name;
  const avail = stockOf(product, colorName, size);
  const views = getViews(product);
  const current = views[view] || views[0];

  const choose = (c, s) => {
    setColor(c);
    setSize(s);
    setQty(stockOf(product, product.colors[c].name, s) > 0 ? 1 : 0);
  };

  // - / + is decided by the server (stock and max per order)
  const changeQty = async (action) => {
    if (busy || avail === 0) return;
    setBusy(true);
    try {
      const r = await shopApi.quantity(id, { color: colorName, size, qty, action });
      setQty(r.qty);
      if (r.limited) notify.info(`Only ${r.max} available for this size`);
    } catch (e) {
      notify.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addToCart = async () => {
    setBusy(true);
    try {
      const r = await shopApi.quantity(id, { color: colorName, size, qty, action: "check" });
      if (!r.inStock) return notify.error("This size is out of stock");
      setQty(r.qty);
      addItem({
        key: `${id}-${colorName}-${size}`,
        productId: id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: current.src || product.img,
        color: colorName,
        size,
        qty: r.qty,
        max: r.max,
      });
    } catch (e) {
      notify.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-top container">
        <nav className="small text-muted-olive mb-4">
          <Link to="/">Home</Link> <i className="bi bi-chevron-right mx-1" />
          <Link to="/#shop">Shop</Link> <i className="bi bi-chevron-right mx-1" />
          <span>{product.name}</span>
        </nav>

        <div className="row g-4 g-lg-5 align-items-start">
          <div className="col-12 col-md-6">
            <div className="detail-img glass">
              <SafeImage
                key={current.src}
                className="detail-main"
                src={current.src}
                alt={`${product.name} - ${current.label}`}
                style={{ transform: `scale(${current.zoom})`, transformOrigin: `${current.x}% ${current.y}%` }}
              />
              {product.tag && <span className="badge-olive">{product.tag}</span>}
              <div className="thumbs" role="tablist" aria-label="Product pictures">
                {views.map((v, i) => (
                  <button key={i} role="tab" aria-selected={view === i} aria-label={v.label} className={`thumb ${view === i ? "active" : ""}`} onClick={() => setView(i)}>
                    <SafeImage src={v.src} alt="" style={{ transform: `scale(${v.zoom})`, transformOrigin: `${v.x}% ${v.y}%` }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <small className="text-muted-olive">{product.category}</small>
            <h1 className="detail-title">{product.name}</h1>
            <div className="d-flex align-items-center gap-3 my-3">
              <span className="price fs-3 fw-bold">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-muted-olive"><i className="bi bi-star-fill me-1 price" />{product.rating} rating</span>
            </div>
            <p className="text-muted-olive">{product.description}</p>

            <h6 className="mt-4">Colour: <span className="text-muted-olive fw-normal">{colorName}</span></h6>
            <div className="d-flex gap-2 mb-4">
              {product.colors.map((c, i) => {
                const any = product.sizes.some((s) => stockOf(product, c.name, s) > 0);
                const s = stockOf(product, c.name, size) > 0 ? size : product.sizes.find((x) => stockOf(product, c.name, x) > 0) || size;
                return (
                  <button key={c.name} aria-label={c.name} disabled={!any} onClick={() => choose(i, s)}
                    className={`swatch ${color === i ? "active" : ""}`} style={{ background: c.hex }} />
                );
              })}
            </div>

            <h6>Size</h6>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {product.sizes.map((s) => (
                <button key={s} disabled={stockOf(product, colorName, s) === 0} onClick={() => choose(color, s)} className={`chip size ${size === s ? "active" : ""}`}>{s}</button>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-3 align-items-center">
              <div className="qty glass">
                <button onClick={() => changeQty("dec")} disabled={busy || avail === 0} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => changeQty("inc")} disabled={busy || avail === 0} aria-label="Increase">+</button>
              </div>
              <button className="btn btn-olive btn-lg px-4 flex-grow-1 flex-sm-grow-0" onClick={addToCart} disabled={busy || avail === 0}>
                {avail === 0 ? "Out of stock" : "Add to cart"}
              </button>
            </div>
            {avail > 0 && avail <= 5 && <p className="text-muted-olive small mt-2 mb-0">Only {avail} left in this size</p>}

            <GlassCard className="p-3 mt-4">
              <ul className="list-unstyled mb-0 small detail-list">
                <li><i className="bi bi-droplet" /> Fabric: {product.fabric}</li>
                <li><i className="bi bi-truck" /> Free shipping above ₹1,999</li>
                <li><i className="bi bi-arrow-repeat" /> 30-day easy returns</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>

      <section className="py-section">
        <div className="container">
          <SectionTitle title="Similar clothes" text="More pieces that go with this one." />
          <ProductGrid items={product.similar} />
        </div>
      </section>
    </>
  );
}
