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

const empty = { name: "", type: "category", description: "", image: "", order: 0, active: true };

export default function Categories() {
  const { data, loading, reload } = useFetch(() => adminApi.categories.list());
  const [f, setF] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const confirm = useConfirm();
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f, order: Number(f.order) };
      if (f.id) await adminApi.categories.update(f.id, body);
      else await adminApi.categories.create(body);
      notify.success("Saved");
      setF(null);
      reload(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const remove = async (c) => {
    if (!(await confirm({ title: `Delete "${c.name}"?`, message: "Products using this name keep their text, but the filter will disappear.", confirmText: "Delete", variant: "danger" }))) return;
    try {
      await adminApi.categories.remove(c.id);
      notify.success("Deleted");
      reload(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const columns = [
    { id: "image", label: "", sortable: false, searchable: false, render: (_, c) => c.image && <img src={c.image} alt="" className="admin-thumb" /> },
    {
      key: "name",
      label: "Name",
      searchValue: (c) => `${c.name} ${c.description || ""}`,
      render: (name, c) => <>{name}<div className="small text-muted-olive">{c.description}</div></>,
    },
    { key: "type", label: "Type", cellClassName: "text-capitalize" },
    { key: "order", label: "Order" },
    {
      key: "active",
      label: "Status",
      searchValue: (c) => c.active ? "Active" : "Hidden",
      sortValue: (c) => c.active ? 1 : 0,
      render: (active) => <span className={`badge ${active ? "bg-success" : "bg-secondary"}`}>{active ? "Active" : "Hidden"}</span>,
    },
    {
      id: "actions",
      label: "",
      sortable: false,
      searchable: false,
      cellClassName: "text-end text-nowrap",
      render: (_, c) => (
        <div className="admin-row-actions">
          <button type="button" className="admin-icon-btn view" title="View category" aria-label={`View ${c.name}`} onClick={() => setViewRecord(c)}>
            <i className="bi bi-eye" />
          </button>
          <button type="button" className="admin-icon-btn edit" title="Edit category" aria-label={`Edit ${c.name}`} onClick={() => setF(c)}>
            <i className="bi bi-pencil" />
          </button>
          <button type="button" className="admin-icon-btn delete" title="Delete category" aria-label={`Delete ${c.name}`} onClick={() => remove(c)}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="Categories and collections">
        {!f && <button className="btn btn-olive btn-sm" onClick={() => setF(empty)}>+ Add</button>}
      </PageHead>

      {f && (
        <GlassCard className="p-3 p-md-4 mb-4">
          <form onSubmit={save} className="row g-3">
            <Field label="Name" className="col-12 col-md-6"><input required className="form-control glass-input" value={f.name} onChange={set("name")} /></Field>
            <Field label="Type" className="col-6 col-md-3">
              <select className="form-select glass-input" value={f.type} onChange={set("type")}>
                <option value="category">Category</option><option value="collection">Collection</option>
              </select>
            </Field>
            <Field label="Order" className="col-6 col-md-3"><input type="number" className="form-control glass-input" value={f.order} onChange={set("order")} /></Field>
            <Field label="Short text"><input className="form-control glass-input" value={f.description} onChange={set("description")} /></Field>
            <Field label="Image"><ImageInput value={f.image} onChange={(v) => setF((s) => ({ ...s, image: v }))} /></Field>
            <div className="col-12 form-check ms-2">
              <input id="c-active" type="checkbox" className="form-check-input" checked={f.active} onChange={set("active")} />
              <label htmlFor="c-active" className="form-check-label">Show on website</label>
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
        <DataTable data={data} columns={columns} emptyMessage="No categories found." searchPlaceholder="Search categories..." />
      )}
      <RecordDetailsModal type="category" record={viewRecord} onClose={() => setViewRecord(null)} />
    </>
  );
}
