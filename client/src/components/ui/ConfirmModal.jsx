import { useEffect } from "react";

export default function ConfirmModal({ title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", variant = "olive", onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="confirm-backdrop" onClick={() => onClose(false)}>
      <div className="confirm-box glass" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <h5 id="confirm-title">{title}</h5>
        {message && <p className="text-muted-olive mb-4">{message}</p>}
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-olive" onClick={() => onClose(false)}>{cancelText}</button>
          <button className={`btn ${variant === "danger" ? "btn-danger-soft" : "btn-olive"}`} onClick={() => onClose(true)} autoFocus>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
