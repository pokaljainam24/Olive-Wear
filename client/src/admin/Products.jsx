import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import { useConfirm } from "../components/ui/ConfirmProvider";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import { PageHead } from "./ui";
import RecordDetailsModal from "./RecordDetailsModal";
import DataTable from "./components/DataTable";

export default function Products() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [viewRecord, setViewRecord] = useState(null);
  const { data, loading, error, reload } = useFetch(() => adminApi.products.list({ q }), [q]);
  const confirm = useConfirm();
  const fileRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const remove = async (p) => {
    if (!(await confirm({ title: "Delete product?", message: `"${p.name}" and its stock will be removed.`, confirmText: "Delete", variant: "danger" }))) return;
    try {
      await adminApi.products.remove(p.id);
      notify.success("Product deleted");
      reload(true);
    } catch (e) {
      notify.error(e.message);
    }
  };

  const bulk = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const r = await adminApi.bulkProducts(f);
      notify.success(`${r.created} products added`);
      if (r.failed.length) notify.warn(`${r.failed.length} rows failed. Row ${r.failed[0].row}: ${r.failed[0].error}`);
      reload(true);
    } catch (err) {
      notify.error(err.message);
    } finally {
      e.target.value = "";
    }
  };

  const sample = async () => {
    try {
      const text = await adminApi.sampleCsv();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
      a.download = "products-sample.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      notify.error(e.message);
    }
  };

  const columns = [
    { id: "image", label: "", sortable: false, searchable: false, render: (_, p) => <img src={p.img} alt="" className="admin-thumb" /> },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", sortValue: (p) => Number(p.price), render: (price) => `₹${price.toLocaleString("en-IN")}` },
    { key: "totalStock", label: "Stock", cellClassName: (p) => p.totalStock === 0 ? "text-danger" : "" },
    {
      key: "active",
      label: "Status",
      searchValue: (p) => p.active ? "Active" : "Hidden",
      sortValue: (p) => p.active ? 1 : 0,
      render: (active) => <span className={`badge ${active ? "bg-success" : "bg-secondary"}`}>{active ? "Active" : "Hidden"}</span>,
    },
    {
      id: "actions",
      label: "",
      sortable: false,
      searchable: false,
      cellClassName: "text-end text-nowrap",
      render: (_, p) => (
        <div className="admin-row-actions">
          <button type="button" className="admin-icon-btn view" title="View product" aria-label={`View ${p.name}`} onClick={() => setViewRecord(p)}>
            <i className="bi bi-eye" />
          </button>
          <Link to={`/admin/products/${p.id}`} className="admin-icon-btn edit" title="Edit product" aria-label={`Edit ${p.name}`}>
            <i className="bi bi-pencil" />
          </Link>
          <button type="button" className="admin-icon-btn delete" title="Delete product" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="Products">
        <button className="btn btn-outline-olive btn-sm" onClick={sample}>Sample CSV</button>
        <button className="btn btn-outline-olive btn-sm" onClick={() => fileRef.current.click()}>Bulk upload (CSV)</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={bulk} />
        <Link to="/admin/products/new" className="btn btn-olive btn-sm">+ Add product</Link>
      </PageHead>

      <input className="form-control glass-input mb-3" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading && <Loader />}
      {error && <p className="text-danger">{error}</p>}
      {data && (
        <DataTable data={data} columns={columns} searchable={false} emptyMessage="No products found." />
      )}
      <RecordDetailsModal type="product" record={viewRecord} onClose={() => setViewRecord(null)} />
    </>
  );
}
