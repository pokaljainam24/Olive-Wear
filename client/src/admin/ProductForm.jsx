import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import GlassCard from "../components/GlassCard";
import ImageInput from "./ImageInput";
import { Field, PageHead } from "./ui";
import AdminSelect from "./components/AdminSelect";

const empty = {
  name: "", category: "", collectionName: "", price: "", tag: "", img: "", gallery: "", description: "", fabric: "",
  sizes: "S, M, L, XL", colors: "Olive:#6b7f3a, Charcoal:#1f2418", active: true, openingStock: 10, location: "Main Warehouse",
};
const toForm = (p) => ({ ...empty, ...p, gallery: (p.gallery || []).join("\n"), sizes: p.sizes.join(", "), colors: p.colors.map((c) => `${c.name}:${c.hex}`).join(", ") });
const list = (s, sep) => s.split(sep).map((x) => x.trim()).filter(Boolean);

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const { data: cats } = useFetch(() => adminApi.categories.list());
  const { data: existing, loading } = useFetch(() => (isNew ? Promise.resolve(null) : adminApi.products.get(id)), [id]);

  useEffect(() => {
    if (existing) setF(toForm(existing));
  }, [existing]);

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.category) {
      notify.error("Please select a category.");
      return;
    }
    const body = {
      name: f.name, category: f.category, collectionName: f.collectionName, price: Number(f.price), tag: f.tag, img: f.img,
      gallery: list(f.gallery, "\n"), description: f.description, fabric: f.fabric, sizes: list(f.sizes, ","), active: f.active,
      colors: list(f.colors, ",").map((c) => {
        const [name, hex] = c.split(":");
        return { name: name.trim(), hex: (hex || "#6b7f3a").trim() };
      }),
      ...(isNew ? { openingStock: Number(f.openingStock), location: f.location } : {}),
    };
    setBusy(true);
    try {
      if (isNew) await adminApi.products.create(body);
      else await adminApi.products.update(id, body);
      notify.success(isNew ? "Product added" : "Product updated");
      navigate("/admin/products");
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  const categories = (cats || []).filter((c) => c.type === "category");
  const collections = (cats || []).filter((c) => c.type === "collection");

  return (
    <>
      <PageHead title={isNew ? "Add product" : "Edit product"} />
      <GlassCard className="p-3 p-md-4">
        <form onSubmit={submit} className="row g-3">
          <Field label="Name" className="col-12 col-md-6"><input required className="form-control glass-input" value={f.name} onChange={set("name")} /></Field>
          <Field label="Price (₹)" className="col-6 col-md-3"><input required type="number" min="0" className="form-control glass-input" value={f.price} onChange={set("price")} /></Field>
          <Field label="Tag (New, Bestseller...)" className="col-6 col-md-3"><input className="form-control glass-input" value={f.tag} onChange={set("tag")} /></Field>
          <Field label="Category" className="col-12 col-md-4">
            <AdminSelect
              required
              value={f.category}
              onChange={(category) => setF((current) => ({ ...current, category }))}
              options={[{ value: "", label: "Select category" }, ...categories.map((category) => ({ value: category.name, label: category.name }))]}
              ariaLabel="Category"
            />
          </Field>
          <Field label="Collection" className="col-12 col-md-4">
            <AdminSelect
              value={f.collectionName}
              onChange={(collectionName) => setF((current) => ({ ...current, collectionName }))}
              options={[{ value: "", label: "None" }, ...collections.map((collection) => ({ value: collection.name, label: collection.name }))]}
              ariaLabel="Collection"
            />
          </Field>
          <Field label="Fabric" className="col-12 col-md-4"><input className="form-control glass-input" value={f.fabric} onChange={set("fabric")} /></Field>
          <Field label="Description"><textarea rows="3" className="form-control glass-input" value={f.description} onChange={set("description")} /></Field>
          <Field label="Sizes (comma separated)" className="col-12 col-md-6"><input className="form-control glass-input" value={f.sizes} onChange={set("sizes")} /></Field>
          <Field label="Colours (Name:#hex, comma separated)" className="col-12 col-md-6"><input className="form-control glass-input" value={f.colors} onChange={set("colors")} /></Field>
          <Field label="Main image"><ImageInput value={f.img} onChange={(v) => setF((s) => ({ ...s, img: v }))} /></Field>
          <Field label="More images (one URL per line)">
            <textarea rows="3" className="form-control glass-input mb-2" value={f.gallery} onChange={set("gallery")} />
            <ImageInput uploadOnly onChange={(url) => setF((s) => ({ ...s, gallery: s.gallery ? `${s.gallery}\n${url}` : url }))} />
          </Field>
          {isNew && (
            <>
              <Field label="Opening stock (for every size and colour)" className="col-6 col-md-3"><input type="number" min="0" className="form-control glass-input" value={f.openingStock} onChange={set("openingStock")} /></Field>
              <Field label="Location" className="col-6 col-md-3"><input className="form-control glass-input" value={f.location} onChange={set("location")} /></Field>
            </>
          )}
          <div className="col-12">
            <div className="form-check">
              <input id="active" type="checkbox" className="form-check-input" checked={f.active} onChange={set("active")} />
              <label htmlFor="active" className="form-check-label">Show on website</label>
            </div>
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-olive px-4" disabled={busy}>{busy ? "Saving..." : "Save product"}</button>
            <button type="button" className="btn btn-outline-olive" onClick={() => navigate("/admin/products")}>Cancel</button>
          </div>
        </form>
      </GlassCard>
    </>
  );
}
