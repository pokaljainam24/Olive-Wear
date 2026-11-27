import { Link } from "react-router-dom";
import { faqs } from "../data/content";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";

export default function FAQ() {
  return (
    <>
      <PageHeader title="Frequently asked questions" crumb="FAQ" text="Quick answers about delivery, returns, payments and care." />
      <section className="pb-section">
        <div className="container faq-wrap">
          <div className="faq-grid">
            {faqs.map((f, i) => (
              <GlassCard key={f.q} className="faq-item">
                <div className="faq-card-top">
                  <span className="faq-index">FAQ {String(i + 1).padStart(2, "0")}</span>
                  <i className="bi bi-question-circle" aria-hidden="true" />
                </div>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="faq-help text-center">
            <h5>Still need help?</h5>
            <p className="text-muted-olive">Our team is happy to answer anything not listed here.</p>
            <Link to="/contact" className="btn btn-olive px-4">Contact us</Link>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
