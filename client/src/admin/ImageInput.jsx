import { useState } from "react";
import { adminApi } from "../api/admin";
import { notify } from "../components/ui/notify";

// Image URL box + Upload button. uploadOnly = just the button (used for the gallery list).
export default function ImageInput({ value, onChange, uploadOnly = false }) {
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const { url } = await adminApi.upload(f);
      onChange(url);
      notify.success("Image uploaded");
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="d-flex gap-2 align-items-center flex-wrap">
      {!uploadOnly && (
        <input className="form-control glass-input flex-grow-1" placeholder="Image URL" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
      <label className="btn btn-outline-olive btn-sm mb-0">
        {busy ? "Uploading..." : "Upload image"}
        <input type="file" accept="image/*" hidden onChange={pick} />
      </label>
      {!uploadOnly && value && <img src={value} alt="" className="admin-thumb" />}
    </div>
  );
}
