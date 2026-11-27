import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import { useConfirm } from "../components/ui/ConfirmProvider";
import { notify } from "../components/ui/notify";
import Loader from "../components/ui/Loader";
import { PageHead, fmtDate } from "./ui";
import DataTable from "./components/DataTable";
import AdminSelect from "./components/AdminSelect";

export default function Queries() {
  const { data, loading, error, reload } = useFetch(() => adminApi.queries.list());
  const confirm = useConfirm();
  const [updating, setUpdating] = useState(() => new Map());
  const [statusOverrides, setStatusOverrides] = useState(() => new Map());

  useEffect(() => {
    if (!data) return;
    setStatusOverrides((current) => {
      const next = new Map(current);
      let changed = false;
      data.forEach((query) => {
        if (next.get(query.id) === query.status) {
          next.delete(query.id);
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [data]);

  const setStatus = async (q, status) => {
    setUpdating((current) => new Map(current).set(q.id, status));
    try {
      await adminApi.queries.update(q.id, { status });
      setStatusOverrides((current) => new Map(current).set(q.id, status));
      notify.success("Status updated");
      reload(true);
    } catch (e) {
      notify.error(e.message);
    } finally {
      setUpdating((current) => {
        const next = new Map(current);
        next.delete(q.id);
        return next;
      });
    }
  };

  const remove = async (q) => {
    if (!(await confirm({ title: "Delete query?", message: `Message from ${q.name} will be deleted.`, confirmText: "Delete", variant: "danger" }))) return;
    try {
      await adminApi.queries.remove(q.id);
      notify.success("Deleted");
      reload(true);
    } catch (e) {
      notify.error(e.message);
    }
  };

  const columns = [
    { key: "createdAt", label: "Date", sortValue: (q) => new Date(q.createdAt).getTime(), render: (createdAt) => <span className="text-nowrap small">{fmtDate(createdAt)}</span> },
    {
      key: "name",
      label: "From",
      searchValue: (q) => `${q.name} ${q.email} ${q.phone || ""}`,
      render: (name, q) => (
        <>
          <strong>{name}</strong>
          <div className="small text-muted-olive">{q.email}</div>
          {q.phone && <div className="small text-muted-olive">{q.phone}</div>}
        </>
      ),
    },
    { key: "topic", label: "Topic" },
    { key: "message", label: "Message", cellClassName: "query-msg" },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (status, q) => (
        updating.has(q.id) ? (
          <div className="query-status-loading" role="status" aria-live="polite">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            {updating.get(q.id) === "resolved" ? "Resolving..." : "Updating..."}
          </div>
        ) : (
          <AdminSelect
            className="form-select form-select-sm glass-input"
            value={statusOverrides.get(q.id) || status}
            onChange={(value) => setStatus(q, value)}
            options={[
              { value: "new", label: "New" },
              { value: "read", label: "Read" },
              { value: "resolved", label: "Resolved" },
            ]}
            ariaLabel="Query status"
          />
        )
      ),
    },
    {
      id: "actions",
      label: "",
      sortable: false,
      searchable: false,
      cellClassName: "text-end",
      render: (_, q) => <button className="btn btn-danger-soft btn-sm" onClick={() => remove(q)}>Delete</button>,
    },
  ];

  return (
    <>
      <PageHead title="Contact queries" />
      {loading && <Loader />}
      {error && <p className="text-danger">{error}</p>}
      {data && (
        <DataTable data={data} columns={columns} emptyMessage="No queries yet." searchPlaceholder="Search contact queries..." />
      )}
    </>
  );
}
