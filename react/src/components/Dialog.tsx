import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../cx";

export type DialogProps = {
  open: boolean;
  /** Escape, the ✕ button, and clicking the backdrop all call this. */
  onClose: () => void;
  title: ReactNode;
  /** Big emoji on the left, e.g. ❌ ⚠️ ℹ️ ❓. */
  glyph?: ReactNode;
  /** Buttons along the bottom. The first focusable one gets focus on open. */
  actions?: ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
  children?: ReactNode;
};

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A modal message box. Rendered into `document.body` with a `.g95` wrapper so it works inside a scoped root too. */
export function Dialog({ open, onClose, title, glyph, actions, closeOnBackdrop = true, className, children }: DialogProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const actionsEl = dialog?.querySelector<HTMLElement>(".g95-dialog__actions");
    (actionsEl?.querySelector<HTMLElement>(FOCUSABLE) ?? focusables()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="g95">
      <div className="g95-modal" onPointerDown={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose()}>
        <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className={cx("g95-window g95-pop g95-dialog", className)}>
          <div className="g95-titlebar">
            <span className="g95-titlebar__text" id={titleId}>{title}</span>
            <span className="g95-titlebar__btns">
              <button type="button" className="g95-close" aria-label="Close" onClick={onClose}>✕</button>
            </span>
          </div>
          <div className="g95-window__body">
            <div className="g95-dialog__row">
              {glyph !== undefined && <span className="g95-dialog__glyph" aria-hidden="true">{glyph}</span>}
              <div>{children}</div>
            </div>
            {actions && <div className="g95-dialog__actions">{actions}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
