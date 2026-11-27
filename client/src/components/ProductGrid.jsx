import ProductCard from "./ProductCard";

// Responsive grid of ProductCards, used on Home and on the product details page.
export default function ProductGrid({ items }) {
  return (
    <div className="row g-3 g-md-4">
      {items.map((p) => (
        <div className="col-6 col-md-4 col-lg-3" key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
