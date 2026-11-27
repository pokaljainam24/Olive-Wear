import { bannerImg } from "../data/static";
import GlassCard from "./GlassCard";

export default function Banner({ content }) {
  return (
    <section className="banner" style={{ backgroundImage: `url(${content?.image || bannerImg})` }}>
      <div className="container">
        <GlassCard className="banner-card reveal mx-auto text-center p-4 p-md-5">
          <h2>{content?.title || "Get 15% off your first order"}</h2>
          <p className="text-muted-olive">{content?.subtitle || "Join the list for drops, restocks and early sales."}</p>
          <div className="input-group mt-4">
            <input type="email" className="form-control glass-input" placeholder="Email address" aria-label="Email" />
            <button className="btn btn-olive px-4">Subscribe</button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
