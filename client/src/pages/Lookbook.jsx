import { shopApi } from "../api/shop";
import useFetch from "../hooks/useFetch";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";
import TiltCard from "../components/TiltCard";
import SafeImage from "../components/SafeImage";
import Loader from "../components/ui/Loader";

export default function Lookbook() {
  const { data, loading } = useFetch(() => shopApi.content("lookbook"));

  return (
    <>
      <PageHeader title="Lookbook" text="Outfit ideas styled from the new collection." />
      <section className="pb-section">
        <div className="container">
          {loading && <Loader />}
          {data?.length === 0 && <p className="text-center text-muted-olive">No lookbooks yet.</p>}
          {data?.map((book) => (
            <div className="mb-5" key={book.id}>
              <div className="section-title reveal text-center mb-4">
                <h2>{book.title}</h2>
                {book.subtitle && <p className="text-muted-olive mx-auto">{book.subtitle}</p>}
              </div>
              <div className="row g-4">
                {book.items.map((it, i) => (
                  <div className="col-12 col-sm-6 col-lg-4 reveal" key={i}>
                    <TiltCard>
                      <GlassCard className="look-card overflow-hidden h-100">
                        {it.image && <SafeImage src={it.image} alt={it.title} />}
                        <div className="p-3">
                          <h6 className="mb-1">{it.title}</h6>
                          <small className="text-muted-olive">{it.text}</small>
                        </div>
                      </GlassCard>
                    </TiltCard>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
