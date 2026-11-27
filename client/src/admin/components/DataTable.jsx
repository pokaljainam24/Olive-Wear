import { useMemo, useState } from "react";
import AdminSelect from "./AdminSelect";

const asText = (value) => {
  if (value === null || value === undefined || typeof value === "object") return "";
  return String(value);
};

const getColumnId = (column, index) => column.id || column.key || `column-${index}`;

export default function DataTable({
  columns,
  data = [],
  rowKey = "id",
  emptyMessage = "No records found.",
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Search...",
  rowClassName,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const rows = Array.isArray(data) ? data : [];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((column) => {
        if (column.searchable === false) return false;
        const value = column.searchValue
          ? column.searchValue(row)
          : column.key
            ? row[column.key]
            : "";
        return asText(value).toLocaleLowerCase().includes(term);
      })
    );
  }, [columns, rows, search]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const column = columns.find((item, index) => getColumnId(item, index) === sort.id);
    if (!column) return filteredRows;
    const valueFor = (row) => column.sortValue
      ? column.sortValue(row)
      : column.key
        ? row[column.key]
        : "";
    return [...filteredRows].sort((a, b) => {
      const left = valueFor(a);
      const right = valueFor(b);
      let result = 0;
      if (left === null || left === undefined) result = right === null || right === undefined ? 0 : -1;
      else if (right === null || right === undefined) result = 1;
      else if (typeof left === "number" && typeof right === "number") result = left - right;
      else result = String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, filteredRows, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const page = Math.min(currentPage, pageCount);
  const pageRows = sortedRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const firstRow = sortedRows.length ? (page - 1) * rowsPerPage + 1 : 0;
  const lastRow = Math.min(page * rowsPerPage, sortedRows.length);

  const toggleSort = (id) => {
    setSort((current) => ({
      id,
      direction: current?.id === id && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  return (
    <div className="glass admin-datatable">
      <div className="admin-datatable-toolbar">
        {searchable && (
          <label className="admin-datatable-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="search"
              className="form-control glass-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              aria-label={searchPlaceholder}
            />
          </label>
        )}
        <div className="admin-datatable-page-size">
          <span>Rows</span>
          <AdminSelect
            className="form-select form-select-sm glass-input"
            value={rowsPerPage}
            onChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
            options={[10, 25, 50].map((size) => ({ value: size, label: String(size) }))}
            ariaLabel="Rows per page"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table admin-table align-middle mb-0">
          <thead>
            <tr>
              {columns.map((column, index) => {
                const id = getColumnId(column, index);
                const canSort = column.sortable !== false && Boolean(column.key || column.sortValue);
                const activeSort = sort?.id === id;
                return (
                  <th key={id} className={column.headerClassName || ""} aria-sort={activeSort ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                    {canSort ? (
                      <button type="button" className="admin-datatable-sort" onClick={() => toggleSort(id)}>
                        {column.label}
                        <i className={`bi ${activeSort ? (sort.direction === "asc" ? "bi-sort-up" : "bi-sort-down") : "bi-arrow-down-up"}`} aria-hidden="true" />
                      </button>
                    ) : column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => {
              const key = typeof rowKey === "function" ? rowKey(row) : row[rowKey];
              return (
                <tr key={key} className={rowClassName ? rowClassName(row) : ""}>
                  {columns.map((column, columnIndex) => {
                    const value = column.key ? row[column.key] : undefined;
                    const cellClassName = typeof column.cellClassName === "function"
                      ? column.cellClassName(row)
                      : column.cellClassName || "";
                    return (
                      <td key={getColumnId(column, columnIndex)} className={cellClassName}>
                        {column.render ? column.render(value, row, (page - 1) * rowsPerPage + rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={Math.max(columns.length, 1)} className="text-center text-muted-olive py-4">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-datatable-footer">
        <span>Showing {firstRow}-{lastRow} of {sortedRows.length}</span>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-olive btn-sm" disabled={page <= 1} onClick={() => setCurrentPage(page - 1)} aria-label="Previous page">
            <i className="bi bi-chevron-left" />
          </button>
          <span className="admin-datatable-page">{page} / {pageCount}</span>
          <button type="button" className="btn btn-outline-olive btn-sm" disabled={page >= pageCount} onClick={() => setCurrentPage(page + 1)} aria-label="Next page">
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
