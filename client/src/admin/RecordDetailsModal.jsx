import { useEffect } from "react";
import SafeImage from "../components/SafeImage";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const detailsFor = (type, record) => {
  if (type === "product") {
    return [
      ["Category", record.category],
      ["Collection", record.collectionName || "—"],
      ["Price", money(record.price)],
      ["Fabric", record.fabric || "—"],
      ["Tag", record.tag || "—"],
      ["Total stock", record.totalStock ?? "—"],
      ["Sizes", Array.isArray(record.sizes) ? record.sizes.join(", ") : "—"],
      ["Status", record.active ? "Active" : "Hidden"],
    ];
  }
  if (type === "category") {
    return [
      ["Type", record.type],
      ["Display order", record.order],
      ["Status", record.active ? "Active" : "Hidden"],
      ["Description", record.description || "—"],
    ];
  }
  return [
    ["Content type", record.type],
    ["Section key", record.key],
    ["Display order", record.order],
    ["Status", record.published ? "Published" : "Draft"],
    ["Subtitle", record.subtitle || "—"],
  ];
};

export default function RecordDetailsModal({ type, record, onClose }) {
  useEffect(() => {
    if (!record) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [record, onClose]);

  if (!record) return null;

  const title = type === "product" ? record.name : type === "category" ? record.name : record.title || record.key;
  const image = type === "product" ? record.img : record.image;
  const extraImages = type === "product" && Array.isArray(record.gallery) ? record.gallery : [];
  const contentItems = type === "content" && Array.isArray(record.items) ? record.items : [];

  return (
    <div className="record-modal-layer">
      <button type="button" className="record-modal-backdrop" onClick={onClose} aria-label="Close details" />
      <section
        className="record-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="record-modal-head">
          <div>
            <span className="record-modal-kicker">{type === "content" ? "CONTENT / CMS" : type.toUpperCase()}</span>
            <h2 id="record-modal-title">{title}</h2>
          </div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="Close details">
            <i className="bi bi-x-lg" />
          </button>
        </header>

        <div className="record-modal-body">
          {image && (
            <div className="record-modal-image">
              <SafeImage src={image} alt={title} />
            </div>
          )}
          <div className="record-details-grid">
            {detailsFor(type, record).map(([label, value]) => (
              <div className={`record-detail${label === "Description" || label === "Subtitle" ? " wide" : ""}`} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          {type === "product" && Array.isArray(record.colors) && record.colors.length > 0 && (
            <section className="record-modal-section">
              <h3>Available colours</h3>
              <div className="record-color-list">
                {record.colors.map((color) => (
                  <span className="record-color" key={color.name}>
                    <i style={{ backgroundColor: color.hex }} />
                    {color.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {type === "product" && record.description && (
            <section className="record-modal-section">
              <h3>Description</h3>
              <p>{record.description}</p>
            </section>
          )}

          {type === "product" && extraImages.length > 0 && (
            <section className="record-modal-section">
              <h3>Gallery</h3>
              <div className="record-gallery">
                {extraImages.map((src, index) => <SafeImage key={`${src}-${index}`} src={src} alt={`${title} gallery ${index + 1}`} />)}
              </div>
            </section>
          )}

          {type === "content" && contentItems.length > 0 && (
            <section className="record-modal-section">
              <h3>Items / sections <span>{contentItems.length}</span></h3>
              <div className="record-content-items">
                {contentItems.map((item, index) => {
                  const fields = item && typeof item === "object" && !Array.isArray(item) ? item : { value: item };
                  return (
                    <article className="record-content-item" key={`${fields.title || "item"}-${index}`}>
                      {typeof fields.image === "string" && fields.image && <SafeImage src={fields.image} alt={fields.title || ""} />}
                      <div>
                        {Object.entries(fields)
                          .filter(([key, value]) => key !== "image" && value !== null && value !== undefined && value !== "")
                          .map(([key, value]) => (
                            <div className="record-content-field" key={key}>
                              <span>{key === "value" ? `Item ${index + 1}` : key}</span>
                              <strong>
                                {key === "icon" && typeof value === "string" && <i className={`bi ${value} me-1`} />}
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </strong>
                            </div>
                          ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
