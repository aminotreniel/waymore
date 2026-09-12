"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export interface Column<T> {
  key: string;
  header: string;
  /** Renders the cell. */
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  minWidth = 860,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  minWidth?: number;
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto scrollbar-slim">
      <table className="w-full" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx(
                  "px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-muted whitespace-nowrap",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-paper/60 transition-colors">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx(
                    "px-5 py-3.5 text-[13.5px] text-heading align-middle",
                    c.align === "right" ? "text-right" : "",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
