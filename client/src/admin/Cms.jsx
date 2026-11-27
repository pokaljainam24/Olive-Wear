import { useState } from "react";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import { useConfirm } from "../components/ui/ConfirmProvider";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import GlassCard from "../components/GlassCard";
import ImageInput from "./ImageInput";
import { Field, PageHead } from "./ui";
import RecordDetailsModal from "./RecordDetailsModal";
import DataTable from "./components/DataTable";

const TYPES = [
  { id: "home", label: "Homepage sections", keys: ["hero", "features", "banner"], hint: "hero: title + subtitle. features: title + items (icon like bi-truck, title, text). banner: title, subtitle, image." },
  { id: "lookbook", label: "Lookbooks", hint: "Title, intro text, cover image and the looks (items with image, title, text). Shown on /lookbook." },
  { id: "sizeguide", label: "Size guides", keys: ["size-guide"], hint: "Each item is one section (title + text). Shown on /size-guide." },
  { id: "policy", label: "Policy pages", keys: ["terms", "privacy", "shipping", "returns"], hint: "Each item is one section (title + text). Shown on /terms, /privacy, /shipping and /returns." },
];

export default function Cms() {
  const [type, setType] = useState("home");
  const cfg = TYPES.find((t) => t.id === type);
  const { data, loading, reload } = useFetch(() => adminApi.content.list({ type }), [type]);
  const [f, setF] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const confirm = useConfirm();

  const blank = () => ({ type, key: cfg.keys?.[0] || "", title: "", subtitle: "", image: "", items: [], published: true, order: 0 });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setItem = (i, k, val) => setF((v) => ({ ...v, items: v.items.map((it, n) => (n === i ? { ...it, [k]: val } : it)) }));

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f, order: Number(f.order) };
      if (f.id) await adminApi.content.update(f.id, body);
      else await adminApi.content.create(body);
      notify.success("Saved");
      setF(null);
      reload(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const remove = async (c) => {
    if (!(await confirm({ title: "Delete this content?", message: `"${c.title || c.key}" will be removed from the website.`, confirmText: "Delete", variant: "danger" }))) return;
    try {
      await adminApi.content.remove(c.id);
      notify.success("Deleted");
      reload(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const columns = [
    { key: "key", label: "Key" },
    { key: "title", label: "Title" },
    {
      key: "items",
      label: "Items",
      searchable: true,
      searchValue: (c) => Array.isArray(c.items) ? c.items.map((item) => Object.values(item || {}).join(" ")).join(" ") : "",
      sortValue: (c) => Array.isArray(c.items) ? c.items.length : 0,
      render: (items) => Array.isArray(items) ? items.length : 0,
    },
    {
      key: "published",
      label: "Status",
      searchValue: (c) => c.published ? "Published" : "Draft",
      sortValue: (c) => c.published ? 1 : 0,
      render: (published) => <span className={`badge ${published ? "bg-success" : "bg-secondary"}`}>{published ? "Published" : "Draft"}</span>,
    },
    {
      id: "actions",
      label: "",
      sortable: false,
      searchable: false,
      cellClassName: "text-end text-nowrap",
      render: (_, c) => (
        <div className="admin-row-actions">
          <button type="button" className="admin-icon-btn view" title="View content" aria-label={`View ${c.title || c.key}`} onClick={() => setViewRecord(c)}>
            <i className="bi bi-eye" />
          </button>
          <button type="button" className="admin-icon-btn edit" title="Edit content" aria-label={`Edit ${c.title || c.key}`} onClick={() => setF({ ...c })}>
            <i className="bi bi-pencil" />
          </button>
          <button type="button" className="admin-icon-btn delete" title="Delete content" aria-label={`Delete ${c.title || c.key}`} onClick={() => remove(c)}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="Content / CMS">
        {!f && <button className="btn btn-olive btn-sm" onClick={() => setF(blank())}>+ Add</button>}
      </PageHead>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {TYPES.map((t) => (
          <button key={t.id} className={`chip ${type === t.id ? "active" : ""}`} onClick={() => { setType(t.id); setF(null); }}>{t.label}</button>
        ))}
      </div>
      <p className="text-muted-olive small">{cfg.hint}</p>

      {f && (
        <GlassCard className="p-3 p-md-4 mb-4">
          <form onSubmit={save} className="row g-3">
            <Field label="Page / section key" className="col-12 col-md-4">
              {cfg.keys ? (
                <select className="form-select glass-input" value={f.key} onChange={set("key")} disabled={!!f.id}>
                  {cfg.keys.map((k) => <option key={k}>{k}</option>)}
                </select>
              ) : (
                <input className="form-control glass-input" placeholder="auto from title" value={f.key} onChange={set("key")} disabled={!!f.id} />
              )}
            </Field>
            <Field label="Title" className="col-12 col-md-8"><input className="form-control glass-input" value={f.title} onChange={set("title")} /></Field>
            <Field label="Subtitle / intro"><textarea rows="2" className="form-control glass-input" value={f.subtitle} onChange={set("subtitle")} /></Field>
            <Field label="Image (optional)"><ImageInput value={f.image} onChange={(v) => setF((s) => ({ ...s, image: v }))} /></Field>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Items / sections</label>
                <button type="button" className="btn btn-outline-olive btn-sm" onClick={() => setF((v) => ({ ...v, items: [...v.items, { title: "", text: "", icon: "", image: "" }] }))}>+ Add item</button>
              </div>
              {f.items.map((it, i) => (
                <div className="cms-item" key={i}>
                  <div className="row g-2">
                    <div className="col-12 col-md-5"><input className="form-control glass-input" placeholder="Title" value={it.title || ""} onChange={(e) => setItem(i, "title", e.target.value)} /></div>
                    <div className="col-12 col-md-7"><textarea rows="2" className="form-control glass-input" placeholder="Text" value={it.text || ""} onChange={(e) => setItem(i, "text", e.target.value)} /></div>
                    {(type === "home" || type === "lookbook") && (
                      <>
                        {type === "home" && <div className="col-12 col-md-4"><input className="form-control glass-input" placeholder="Icon (bi-truck)" value={it.icon || ""} onChange={(e) => setItem(i, "icon", e.target.value)} /></div>}
                        {type === "lookbook" && <div className="col-12 col-md-8"><ImageInput value={it.image} onChange={(v) => setItem(i, "image", v)} /></div>}
                      </>
                    )}
                    <div className="col-12 text-end"><button type="button" className="btn btn-danger-soft btn-sm" onClick={() => setF((v) => ({ ...v, items: v.items.filter((_, n) => n !== i) }))}>Remove item</button></div>
                  </div>
                </div>
              ))}
            </div>

            <Field label="Order" className="col-6 col-md-3"><input type="number" className="form-control glass-input" value={f.order} onChange={set("order")} /></Field>
            <div className="col-6 col-md-9 d-flex align-items-end">
              <div className="form-check">
                <input id="pub" type="checkbox" className="form-check-input" checked={f.published} onChange={set("published")} />
                <label htmlFor="pub" className="form-check-label">Published</label>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-olive px-4">Save</button>
              <button type="button" className="btn btn-outline-olive" onClick={() => setF(null)}>Cancel</button>
            </div>
          </form>
        </GlassCard>
      )}

      {loading && <Loader />}
      {data && (
        <DataTable data={data} columns={columns} emptyMessage='Nothing here yet. Click "+ Add".' searchPlaceholder="Search content..." />
      )}
      <RecordDetailsModal type="content" record={viewRecord} onClose={() => setViewRecord(null)} />
    </>
  );
}
