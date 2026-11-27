import SectionTitle from "./SectionTitle";
import GlassCard from "./GlassCard";

const fallback = [
  { icon: "bi-truck", title: "Free shipping", text: "On every order above ₹1,999." },
  { icon: "bi-arrow-repeat", title: "30-day returns", text: "Does not fit? Send it back, no questions." },
  { icon: "bi-flower1", title: "Organic fabrics", text: "Cotton and linen from certified farms." },
  { icon: "bi-shield-check", title: "Secure payment", text: "UPI, cards and cash on delivery." },
];

export default function Features({ content }) {
  const items = content?.items?.length ? content.items : fallback;
  return (
    <section id="features" className="py-section">
      <div className="container">
        <SectionTitle title={content?.title || "Why shop with us"} />
        <div className="row g-4">
          {items.map((f, i) => (
            <div className="col-12 col-sm-6 col-lg-3 reveal" key={i}>
              <GlassCard className="h-100 p-4 text-center">
                <i className={`bi ${f.icon || "bi-stars"} feature-icon`} />
                <h6 className="mt-3">{f.title}</h6>
                <p className="text-muted-olive mb-0 small">{f.text}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
