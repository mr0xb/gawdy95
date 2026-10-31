import { useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cx } from "../cx";

export type MenuBarItem = string | { label: string; onClick?: () => void; /** Index of the letter to underline (default 0). */ accessKey?: number };

export type WindowProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  icon?: ReactNode;
  /** Inactive windows get a grey title bar. Default true. */
  active?: boolean;
  /** Hard offset shadow and thicker bevel. */
  pop?: boolean;
  chunky?: boolean;
  /** Menu bar labels; the first letter (or `accessKey` index) is underlined. */
  menu?: MenuBarItem[];
  /** Status bar cells. The last cell shrinks to fit. */
  status?: ReactNode[];
  /** White text-editor body. */
  notepad?: boolean;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  /** Title bar buttons to show. Default: none. */
  controls?: ("min" | "max" | "close" | "help")[];
  /** Called by the ✕ button. When omitted the window hides itself. */
  onClose?: () => void;
  onHelp?: () => void;
  defaultMinimized?: boolean;
  defaultMaximized?: boolean;
  /** Drag by the title bar. The window becomes `position: absolute` at `defaultPosition`. */
  draggable?: boolean;
  defaultPosition?: { x: number; y: number };
  children?: ReactNode;
};

function MenuLabel({ item }: { item: MenuBarItem }) {
  const { label, accessKey = 0 } = typeof item === "string" ? { label: item } : item;
  if (accessKey < 0 || accessKey >= label.length) return <>{label}</>;
  return (
    <>
      {label.slice(0, accessKey)}
      <u>{label[accessKey]}</u>
      {label.slice(accessKey + 1)}
    </>
  );
}

export function Window({
  title,
  icon,
  active = true,
  pop,
  chunky,
  menu,
  status,
  notepad,
  bodyClassName,
  bodyStyle,
  controls = [],
  onClose,
  onHelp,
  defaultMinimized = false,
  defaultMaximized = false,
  draggable,
  defaultPosition = { x: 24, y: 24 },
  className,
  style,
  children,
  ...rest
}: WindowProps) {
  const [minimized, setMinimized] = useState(defaultMinimized);
  const [maximized, setMaximized] = useState(defaultMaximized);
  const [closed, setClosed] = useState(false);
  const [pos, setPos] = useState(defaultPosition);
  const ref = useRef<HTMLElement>(null);

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggable || maximized || e.button !== 0 || (e.target as Element).closest("button")) return;
    const win = ref.current;
    if (!win) return;
    const parent = (win.offsetParent as HTMLElement | null) ?? document.body;
    const pr = parent.getBoundingClientRect();
    const r = win.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    const move = (ev: PointerEvent) => setPos({ x: ev.clientX - dx - pr.left, y: ev.clientY - dy - pr.top });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    e.preventDefault();
  };

  const close = () => (onClose ? onClose() : setClosed(true));

  return (
    <section
      ref={ref}
      className={cx("g95-window", pop && "g95-pop", chunky && "g95-chunky", !active && "is-inactive", minimized && "is-min", maximized && "is-max", closed && "is-closed", className)}
      style={draggable ? { left: pos.x, top: pos.y, ...style } : style}
      data-g95-drag={draggable ? "" : undefined}
      aria-label={typeof title === "string" ? title : undefined}
      {...rest}
    >
      <div className="g95-titlebar" onPointerDown={startDrag}>
        {icon !== undefined && <span className="g95-titlebar__icon" aria-hidden="true">{icon}</span>}
        <span className="g95-titlebar__text">{title}</span>
        {controls.length > 0 && (
          <span className="g95-titlebar__btns">
            {controls.includes("help") && <button type="button" aria-label="Help" onClick={onHelp}>?</button>}
            {controls.includes("min") && (
              <button type="button" aria-label={minimized ? "Restore" : "Minimize"} aria-pressed={minimized} onClick={() => setMinimized((m) => !m)}>_</button>
            )}
            {controls.includes("max") && (
              <button type="button" aria-label={maximized ? "Restore" : "Maximize"} aria-pressed={maximized} onClick={() => setMaximized((m) => !m)}>□</button>
            )}
            {controls.includes("close") && <button type="button" className="g95-close" aria-label="Close" onClick={close}>✕</button>}
          </span>
        )}
      </div>
      {menu && menu.length > 0 && (
        <div className="g95-menubar">
          {menu.map((item, i) => {
            const onClick = typeof item === "string" ? undefined : item.onClick;
            return onClick ? (
              <button key={i} type="button" className="g95-menubar__item" onClick={onClick}><MenuLabel item={item} /></button>
            ) : (
              <span key={i}><MenuLabel item={item} /></span>
            );
          })}
        </div>
      )}
      <div className={cx("g95-window__body", notepad && "g95-notepad", bodyClassName)} style={bodyStyle}>
        {children}
      </div>
      {status && status.length > 0 && (
        <div className="g95-statusbar">
          {status.map((s, i) => <span key={i}>{s}</span>)}
        </div>
      )}
    </section>
  );
}
