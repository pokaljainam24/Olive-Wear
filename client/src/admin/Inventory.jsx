import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import { useConfirm } from "../components/ui/ConfirmProvider";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import GlassCard from "../components/GlassCard";
import { Field, PageHead } from "./ui";
import DataTable from "./components/DataTable";
import AdminSelect from "./components/AdminSelect";

const blank = { product: "", color: "", size: "", location: "Main Warehouse", qty: 0, reorderLevel: 5 };

export default function Inventory() {
  const [filters, setFilters] = useState({ product: "", location: "", low: "" });
  const { data, loading, reload } = useFetch(() => adminApi.inventory.list(filters), [filters.product, filters.location, filters.low]);
  const { data: products } = useFetch(() => adminApi.products.list());
  const { data: locations, reload: reloadLoc } = useFetch(() => adminApi.inventory.locations());
  const [row, setRow] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const confirm = useConfirm();

  // "real time": refresh stock every 10 seconds
  useEffect(() => {
    const t = setInterval(() => reload(true), 10000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = products?.find((p) => p.id === row.product);

  const add = async (e) => {
    e.preventDefault();
    if (!row.product || !row.color || !row.size) {
      notify.error("Select a product, colour and size.");
      return;
    }
    try {
      await adminApi.inventory.create({ ...row, qty: Number(row.qty), reorderLevel: Number(row.reorderLevel) });
      notify.success("Stock saved");
      setRow(blank);
      setShowForm(false);
      reload(true);
      reloadLoc(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const update = async (r, field, value) => {
    if (Number(value) === r[field] || value === "") return;
    try {
      await adminApi.inventory.update(r.id, { [field]: Number(value) });
      notify.success("Updated");
      reload(true);
    } catch (err) {
      notify.error(err.message);
      reload(true);
    }
  };

  const remove = async (r) => {
    if (!(await confirm({ title: "Remove stock row?", message: `${r.product.name} · ${r.color} · ${r.size} at ${r.location}`, confirmText: "Remove", variant: "danger" }))) return;
    try {
      await adminApi.inventory.remove(r.id);
      notify.success("Removed");
      reload(true);
    } catch (err) {
      notify.error(err.message);
    }
  };

  const sum = data?.summary;
  const columns = [
    { key: "product", label: "Product", searchValue: (r) => r.product.name, sortValue: (r) => r.product.name, render: (_, r) => r.product.name },
    { key: "color", label: "Colour" },
    { key: "size", label: "Size" },
    { key: "location", label: "Location" },
    {
      key: "qty",
      label: "Qty",
      render: (qty, r) => (
        <>
          <input type="number" min="0" className="form-control glass-input qty-cell" defaultValue={qty} key={`q${r.id}-${qty}`}
            onBlur={(event) => update(r, "qty", event.target.value)} onKeyDown={(event) => event.key === "Enter" && event.target.blur()} />
          {r.low && <span className="badge bg-warning text-dark ms-2">{qty === 0 ? "Out" : "Low"}</span>}
        </>
      ),
    },
    {
      key: "reorderLevel",
      label: "Alert at",
      render: (reorderLevel, r) => (
        <input type="number" min="0" className="form-control glass-input qty-cell" defaultValue={reorderLevel} key={`l${r.id}-${reorderLevel}`}
          onBlur={(event) => update(r, "reorderLevel", event.target.value)} onKeyDown={(event) => event.key === "Enter" && event.target.blur()} />
      ),
    },
    {
      id: "actions",
      label: "",
      sortable: false,
      searchable: false,
      cellClassName: "text-end",
      render: (_, r) => <button className="btn btn-danger-soft btn-sm" onClick={() => remove(r)}>Remove</button>,
    },
  ];

  return (
    <>
      <PageHead title="Inventory">
        <button className="btn btn-olive btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "+ Add / set stock"}</button>
      </PageHead>

      {sum && (
        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3"><GlassCard className="stat p-3"><div className="stat-num">{sum.totalUnits}</div><small className="text-muted-olive">Total units</small></GlassCard></div>
          <div className="col-6 col-md-3"><GlassCard className="stat p-3"><div className="stat-num">{sum.lowCount}</div><small className="text-muted-olive">Restock alerts</small></GlassCard></div>
          <div className="col-6 col-md-3"><GlassCard className="stat p-3"><div className="stat-num">{sum.outCount}</div><small className="text-muted-olive">Out of stock</small></GlassCard></div>
          <div className="col-6 col-md-3">
            <GlassCard className="p-3 h-100">
              <small className="text-muted-olive d-block mb-1">By location</small>
              {sum.byLocation.map((l) => <div key={l.location} className="small d-flex justify-content-between"><span>{l.location}</span><strong>{l.total}</strong></div>)}
            </GlassCard>
          </div>
        </div>
      )}

      {showForm && (
        <GlassCard className="p-3 p-md-4 mb-4">
          <p className="text-muted-olive small">If the same product, colour, size and location already exists, its quantity is replaced.</p>
          <form onSubmit={add} className="row g-3">
            <Field label="Product" className="col-12 col-md-4">
              <AdminSelect
                required
                value={row.product}
                onChange={(product) => setRow((current) => ({ ...current, product, color: "", size: "" }))}
                options={[{ value: "", label: "Select product" }, ...(products || []).map((product) => ({ value: product.id, label: product.name }))]}
                ariaLabel="Product"
              />
            </Field>
            <Field label="Colour" className="col-6 col-md-2">
              <AdminSelect
                required
                value={row.color}
                onChange={(color) => setRow((current) => ({ ...current, color }))}
                options={[{ value: "", label: "Select" }, ...(selected?.colors || []).map((color) => ({ value: color.name, label: color.name }))]}
                ariaLabel="Colour"
              />
            </Field>
            <Field label="Size" className="col-6 col-md-2">
              <AdminSelect
                required
                value={row.size}
                onChange={(size) => setRow((current) => ({ ...current, size }))}
                options={[{ value: "", label: "Select" }, ...(selected?.sizes || []).map((size) => ({ value: size, label: size }))]}
                ariaLabel="Size"
              />
            </Field>
            <Field label="Location" className="col-12 col-md-4">
              <input list="locs" className="form-control glass-input" value={row.location} onChange={(e) => setRow({ ...row, location: e.target.value })} />
              <datalist id="locs">{locations?.map((l) => <option key={l} value={l} />)}</datalist>
            </Field>
            <Field label="Quantity" className="col-6 col-md-3"><input type="number" min="0" className="form-control glass-input" value={row.qty} onChange={(e) => setRow({ ...row, qty: e.target.value })} /></Field>
            <Field label="Alert when at or below" className="col-6 col-md-3"><input type="number" min="0" className="form-control glass-input" value={row.reorderLevel} onChange={(e) => setRow({ ...row, reorderLevel: e.target.value })} /></Field>
            <div className="col-12"><button className="btn btn-olive px-4">Save stock</button></div>
          </form>
        </GlassCard>
      )}

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <AdminSelect
            value={filters.product}
            onChange={(product) => setFilters((current) => ({ ...current, product }))}
            options={[{ value: "", label: "All products" }, ...(products || []).map((product) => ({ value: product.id, label: product.name }))]}
            ariaLabel="Filter by product"
          />
        </div>
        <div className="col-6 col-md-3">
          <AdminSelect
            value={filters.location}
            onChange={(location) => setFilters((current) => ({ ...current, location }))}
            options={[{ value: "", label: "All locations" }, ...(locations || []).map((location) => ({ value: location, label: location }))]}
            ariaLabel="Filter by location"
          />
        </div>
        <div className="col-6 col-md-3 d-flex align-items-center">
          <div className="form-check">
            <input id="low" type="checkbox" className="form-check-input" checked={filters.low === "true"} onChange={(e) => setFilters((f) => ({ ...f, low: e.target.checked ? "true" : "" }))} />
            <label htmlFor="low" className="form-check-label">Low stock only</label>
          </div>
        </div>
      </div>

      {loading && <Loader />}
      {data && (
        <DataTable data={data.rows} columns={columns} rowClassName={(r) => r.low ? "row-low" : ""} emptyMessage="No stock rows." searchPlaceholder="Search stock..." />
      )}
      <p className="text-muted-olive small mt-2">Stock refreshes automatically every 10 seconds. Edit a number and press Enter to save.</p>
    </>
  );
}
