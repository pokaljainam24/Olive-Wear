import { Link } from "react-router-dom";
import { shopApi } from "../api/shop";
import useFetch from "../hooks/useFetch";
import SectionTitle from "./SectionTitle";
import TiltCard from "./TiltCard";
import SafeImage from "./SafeImage";

export default function Categories() {
  const { data: categories } = useFetch(() => shopApi.categories("category"));
  if (!categories?.length) return null;
  const repeats = Math.max(2, Math.ceil(8 / categories.length));
  const carouselCategories = Array.from({ length: repeats }, () => categories).flat();
  const duration = Math.max(carouselCategories.length * 3, 20);

  return (
    <section id="categories" className="py-section">
      <div className="container">
        <SectionTitle title="Shop by category" text="Pick a category to start." />
        <div className="cat-scroll reveal">
          <div
            className="cat-track"
            style={{ "--cat-duration": `${duration}s` }}
          >
            {[false, true].map((duplicate) => (
              <div
                className="cat-group"
                key={duplicate ? "duplicate" : "original"}
                aria-hidden={duplicate || undefined}
              >
                {carouselCategories.map((c, index) => (
                  <div className="cat-item" key={`${c.id}-${index}`}>
                    <TiltCard>
                      <Link
                        to="/#shop"
                        className="cat-card"
                        tabIndex={duplicate ? -1 : undefined}
                      >
                        <SafeImage src={c.image} alt={c.name} />
                        <div className="cat-info">
                          <h5 className="mb-1">{c.name}</h5>
                          <small>{c.description}</small>
                        </div>
                      </Link>
                    </TiltCard>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
