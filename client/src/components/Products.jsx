import { useState } from "react";
import { shopApi } from "../api/shop";
import useFetch from "../hooks/useFetch";
import SectionTitle from "./SectionTitle";
import ProductGrid from "./ProductGrid";
import Loader from "./ui/Loader";

export default function Products() {
  const [active, setActive] = useState("All");
  const { data: cats } = useFetch(() => shopApi.categories("category"));
  const { data: list, loading, error } = useFetch(() => shopApi.products({ category: active }), [active]);
  const filters = ["All", ...(cats || []).map((c) => c.name)];

  return (
    <section id="shop" className="py-section">
      <div className="container">
        <SectionTitle title="New arrivals" text="Pick a filter to narrow the list." />
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-5 reveal">
          {filters.map((f) => (
            <button key={f} onClick={() => setActive(f)} className={`chip ${active === f ? "active" : ""}`}>
              {f}
            </button>
          ))}
        </div>
        {loading && <Loader />}
        {error && <p className="text-center text-muted-olive">{error}</p>}
        {list && (list.length ? <ProductGrid items={list} /> : <p className="text-center text-muted-olive">No products in this category yet.</p>)}
      </div>
    </section>
  );
}
