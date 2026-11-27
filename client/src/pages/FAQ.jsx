import { useState } from "react";
import { Link } from "react-router-dom";
import { faqs } from "../data/content";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <PageHeader title="Frequently asked questions" crumb="FAQ" text="Quick answers about delivery, returns, payments and care." />
      <section className="pb-section">
        <div className="container faq-wrap">
          {faqs.map((f, i) => (
            <GlassCard key={f.q} className={`faq-item reveal ${open === i ? "open" : ""}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span>
                <i className="bi bi-plus-lg" />
              </button>
              <div className="faq-a"><div><p>{f.a}</p></div></div>
            </GlassCard>
          ))}
          <GlassCard className="text-center p-4 mt-4 reveal">
            <h5>Still need help?</h5>
            <p className="text-muted-olive">Our team is happy to answer anything not listed here.</p>
            <Link to="/contact" className="btn btn-olive px-4">Contact us</Link>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
