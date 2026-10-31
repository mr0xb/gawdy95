import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../cx";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { /** Courier New instead of Arial. */ mono?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ mono, className, ...rest }, ref) {
  return <input ref={ref} className={cx("g95-input", mono && "is-mono", className)} {...rest} />;
});

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean };

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ mono, className, ...rest }, ref) {
  return <textarea ref={ref} className={cx("g95-textarea", mono && "is-mono", className)} {...rest} />;
});

export type SelectOption = string | { value: string; label: ReactNode; disabled?: boolean };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Shorthand for `<option>` children. */
  options?: SelectOption[];
  wrapClassName?: string;
};

/** A select with the chunky Win95 drop-down arrow. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, className, wrapClassName, children, ...rest }, ref) {
  return (
    <div className={cx("g95-selectwrap", wrapClassName)}>
      <select ref={ref} className={cx("g95-select", className)} {...rest}>
        {options?.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ),
        )}
        {children}
      </select>
    </div>
  );
});

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; labelClassName?: string };

export const Checkbox = forwardRef<HTMLInputElement, ToggleProps>(function Checkbox({ label, labelClassName, ...rest }, ref) {
  return (
    <label className={cx("g95-check", labelClassName)}>
      <input ref={ref} type="checkbox" {...rest} /> {label}
    </label>
  );
});

export const Radio = forwardRef<HTMLInputElement, ToggleProps>(function Radio({ label, labelClassName, ...rest }, ref) {
  return (
    <label className={cx("g95-radio", labelClassName)}>
      <input ref={ref} type="radio" {...rest} /> {label}
    </label>
  );
});

export const Range = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function Range({ className, ...rest }, ref) {
  return <input ref={ref} type="range" className={cx("g95-range", className)} {...rest} />;
});

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** 0–100. Omit with `animated` for an indeterminate bar. */
  value?: number;
  rainbow?: boolean;
  /** Loops the fill forever; good for "please wait". */
  animated?: boolean;
  label?: string;
};

export function Progress({ value, rainbow, animated, label = "Progress", className, style, ...rest }: ProgressProps) {
  const pct = value === undefined ? undefined : Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cx("g95-progress", rainbow && "g95-progress--rainbow", animated && "g95-progress--anim", className)}
      style={pct === undefined ? style : { ...style, ["--p" as string]: `${pct}%` }}
      {...rest}
    >
      <i />
    </div>
  );
}

export type GrooveProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & { legend?: ReactNode };

/** An etched group box (`<fieldset>`) with a legend sitting on the border. */
export function Groove({ legend, className, children, ...rest }: GrooveProps) {
  return (
    <fieldset className={cx("g95-groove", className)} {...rest}>
      {legend !== undefined && <legend>{legend}</legend>}
      {children}
    </fieldset>
  );
}

export type FormProps = FormHTMLAttributes<HTMLFormElement> & { /** Label/field rows side by side (stacks under 760px). */ inline?: boolean };

export function Form({ inline, className, ...rest }: FormProps) {
  return <form className={cx("g95-form", inline && "g95-form--inline", className)} {...rest} />;
}

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx("g95-label", className)} {...rest} />;
}

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  /** A single control. Its `id` is generated and linked to the label unless you pass one. */
  children: ReactElement<{ id?: string }>;
  /** Use inside `<Form inline>` for a label/field row. */
  row?: boolean;
};

export function Field({ label, children, row, className, ...rest }: FieldProps) {
  const generated = useId();
  const child = Children.only(children);
  const id = (isValidElement(child) && child.props.id) || generated;
  return (
    <div className={cx(row && "g95-field-row", className)} {...rest}>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(child, { id })}
    </div>
  );
}
