/**
 * columns: [{ key, header, render?: (row) => node, className? }]
 * rows: array of data objects, each needs a stable `id` (or pass getRowKey)
 */
export default function DataTable({ columns, rows, getRowKey = (row) => row.id, emptyMessage = 'Nothing to show yet.' }) {
  if (!rows.length) {
    return <p className="rounded-xl border border-ink-50 bg-white py-10 text-center text-ash">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-50 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink-50 bg-ink-50/50 text-xs uppercase tracking-wide text-ash">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/30">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
