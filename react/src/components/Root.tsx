import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../cx";

let bodyUsers = 0;

/** Adds the `g95` class to `<body>` while mounted: desktop background, base font and the scoped reset. */
export function useGawdyBody(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    bodyUsers += 1;
    document.body.classList.add("g95");
    return () => {
      bodyUsers -= 1;
      if (bodyUsers === 0) document.body.classList.remove("g95");
    };
  }, [enabled]);
}

export type GawdyRootProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * `body` (default) puts `g95` on `<body>` for the full desktop look.
   * `scope` puts it on a wrapping `<div>` instead, so Gawdy95 can live inside a larger app.
   */
  mode?: "body" | "scope";
  children?: ReactNode;
};

export function GawdyRoot({ mode = "body", className, children, ...rest }: GawdyRootProps) {
  useGawdyBody(mode === "body");
  if (mode === "body") return <>{children}</>;
  return (
    <div className={cx("g95", className)} {...rest}>
      {children}
    </div>
  );
}
