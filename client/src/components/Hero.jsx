import { useState } from "react";
import { heroImages } from "../data/static";
import SafeImage from "./SafeImage";

export default function Hero({ content }) {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const title = content?.title || "Wear the colour of calm.";
  const subtitle = content?.subtitle || "Olive-toned layers, soft fabrics and clean cuts. New season pieces are in.";

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRot({
      y: ((e.clientX - r.left) / r.width - 0.5) * 24,
      x: -((e.clientY - r.top) / r.height - 0.5) * 18,
    });
  };

  return (
    <section id="home" className="hero d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-2 order-lg-1 text-center text-lg-start">
            <h1 className="hero-title hero-in">{title}</h1>
            <p className="text-muted-olive fs-5 my-4 hero-in">{subtitle}</p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start hero-in">
              <a href="#shop" className="btn btn-olive btn-lg px-4">Shop new arrivals</a>
              <a href="#categories" className="btn btn-outline-olive btn-lg px-4">Browse categories</a>
            </div>
          </div>

          <div className="col-lg-6 order-1 order-lg-2">
            <div className="stage" onMouseMove={onMove} onMouseLeave={() => setRot({ x: 0, y: 0 })}>
              <div className="stack" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
                <div className="layer l-left"><SafeImage src={heroImages.left} alt="Olive hoodie" /></div>
                <div className="layer l-right"><SafeImage src={heroImages.right} alt="Field jacket" /></div>
                <div className="layer l-main"><SafeImage src={heroImages.main} alt="Garden dress" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
