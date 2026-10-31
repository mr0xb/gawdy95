import type { HTMLAttributes, Key, ReactNode, TableHTMLAttributes } from "react";
import { cx } from "../cx";

export type TreeNode = {
  label: ReactNode;
  /** Leaf nodes get a 📄 icon; anything else gets 📁. Defaults to true when there are no children. */
  file?: boolean;
  children?: TreeNode[];
  key?: Key;
};

function TreeItems({ nodes }: { nodes: TreeNode[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        const file = n.file ?? !n.children?.length;
        return (
          <li key={n.key ?? i} className={file ? "is-file" : undefined}>
            {n.label}
            {n.children && n.children.length > 0 && (
              <ul>
                <TreeItems nodes={n.children} />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}

export type TreeProps = HTMLAttributes<HTMLUListElement> & { nodes: TreeNode[] };

/** A static Explorer-style folder tree. */
export function Tree({ nodes, className, ...rest }: TreeProps) {
  return (
    <ul className={cx("g95-tree", className)} {...rest}>
      <TreeItems nodes={nodes} />
    </ul>
  );
}

export type Column<Row> = {
  key: string;
  header: ReactNode;
  /** Right-align with tabular numbers. */
  numeric?: boolean;
  /** Cell content. Defaults to `row[key]`. */
  render?: (row: Row, index: number) => ReactNode;
};

export type TableProps<Row> = TableHTMLAttributes<HTMLTableElement> & {
  /** Spreadsheet look: grey, centered first column. */
  sheet?: boolean;
  /** Data mode. Omit `columns` to write `<thead>`/`<tbody>` yourself as children. */
  columns?: Column<Row>[];
  rows?: Row[];
  rowKey?: (row: Row, index: number) => Key;
};

export function Table<Row extends object>({ sheet, columns, rows = [], rowKey, className, children, ...rest }: TableProps<Row>) {
  return (
    <table className={cx("g95-table", sheet && "g95-table--sheet", className)} {...rest}>
      {columns ? (
        <>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key} className={c.numeric ? "is-num" : undefined}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={rowKey ? rowKey(row, i) : i}>
                {columns.map((c) => (
                  <td key={c.key} className={c.numeric ? "is-num" : undefined}>
                    {c.render ? c.render(row, i) : (row as Record<string, ReactNode>)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </>
      ) : (
        children
      )}
    </table>
  );
}
