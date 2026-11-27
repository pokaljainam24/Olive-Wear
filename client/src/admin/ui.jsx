// Small helpers shared by the admin pages.
export const Field = ({ label, children, className = "col-12" }) => (
  <div className={className}>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export const PageHead = ({ title, children }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
    <h2 className="h3 mb-0">{title}</h2>
    <div className="d-flex flex-wrap gap-2">{children}</div>
  </div>
);

export const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
