import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";
import GlassCard from "./GlassCard";

// Shared layout for Terms and Privacy: sticky contents list + sections.
export default function LegalPage({ title, text, updated, sections }) {
  return (
    <>
      <PageHeader title={title} text={text} />
      <section className="pb-section">
        <div className="container">
          <div className="row g-4">
            <aside className="col-lg-3 d-none d-lg-block">
              <GlassCard className="legal-toc p-3">
                <h6 className="mb-3">On this page</h6>
                {sections.map((s) => (
                  <Link key={s.id} to={`#${s.id}`}>{s.title}</Link>
                ))}
              </GlassCard>
            </aside>
            <div className="col-12 col-lg-9">
              <GlassCard className="p-4 p-md-5">
                <p className="text-muted-olive small">Last updated: {updated}</p>
                {sections.map((s) => (
                  <div key={s.id} id={s.id} className="legal-block">
                    <h4>{s.title}</h4>
                    <p className="text-muted-olive mb-0">{s.text}</p>
                  </div>
                ))}
                <p className="mb-0 mt-4">Questions? <Link to="/contact" className="price">Contact us</Link>.</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
