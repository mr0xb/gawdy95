import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "../cx";

export type ButtonVariant = "normal" | "default" | "ok" | "danger" | "rainbow" | "flat";

type Common = {
  /** `default` is the thick-bordered default action; `ok`/`danger`/`rainbow` are gradient fills. */
  variant?: ButtonVariant;
  big?: boolean;
  block?: boolean;
  /** Render held down (toggle buttons, active taskbar tasks). */
  pressed?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonAsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };
export type ButtonAsLink = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common> & { href: string };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClass({ variant = "normal", big, block, pressed, className }: Common): string {
  return cx("g95-btn", variant !== "normal" && `g95-btn--${variant}`, big && "g95-btn--big", block && "g95-btn--block", pressed && "is-pressed", className);
}

/** A bevelled Win95 button. Pass `href` to render a link that looks like a button. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const { variant, big, block, pressed, className, ...rest } = props;
  const cls = buttonClass({ variant, big, block, pressed, className });
  if (rest.href !== undefined) {
    return <a ref={ref as Ref<HTMLAnchorElement>} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  }
  const { type = "button", ...btn } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button ref={ref as Ref<HTMLButtonElement>} type={type} className={cls} aria-pressed={pressed} {...btn} />;
});

export function ButtonRow({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("g95-btn-row", className)} {...rest} />;
}
