import { Link } from "react-router-dom";
import TiltCard from "./TiltCard";
import SafeImage from "./SafeImage";

export default function ProductCard({ product }) {
  const { id, name, category, price, tag, img } = product;
  return (
    <TiltCard>
      <article className="product glass">
        <Link to={`/product/${id}`} className="product-img d-block">
          <SafeImage src={img} alt={name} />
          {tag && <span className="badge-olive">{tag}</span>}
        </Link>
        <div className="p-3">
          <small className="text-muted-olive">{category}</small>
          <h6 className="my-1"><Link to={`/product/${id}`} className="plain">{name}</Link></h6>
          <div className="d-flex justify-content-between align-items-center mt-2 gap-2">
            <strong className="price">₹{price.toLocaleString("en-IN")}</strong>
            <Link to={`/product/${id}`} className="btn btn-olive btn-sm">View</Link>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
