import { createElement, type ElementType, type HTMLAttributes } from "react";
import { cx, gapStyle } from "../cx";

type Gap = { /** Spacing between children: a number in px or any CSS length. Sets `--g`. */ gap?: number | string };
type BoxProps = HTMLAttributes<HTMLElement> & Gap & { as?: ElementType };

function box(base: string, displayName: string) {
  function Box({ as = "div", gap, className, style, ...rest }: BoxProps) {
    return createElement(as, { className: cx(base, className), style: gapStyle(gap, style), ...rest });
  }
  Box.displayName = displayName;
  return Box;
}

/** Centered page column, max 1180px. */
export const Wrap = box("g95-wrap", "Wrap");
/** Vertical flex column. */
export const Stack = box("g95-stack", "Stack");
/** Wrapping horizontal flex row. */
export const Row = box("g95-row", "Row");
/** Responsive auto-fit grid (min 280px columns). */
export const Auto = box("g95-auto", "Auto");
/** 220px sidebar + fluid main column; stacks on narrow screens. */
export const Split = box("g95-split", "Split");

export type GridProps = BoxProps & { /** Number of equal columns (default 2). Collapses to one under 760px. */ cols?: number };

export function Grid({ as = "div", gap, cols, className, style, ...rest }: GridProps) {
  const s = cols === undefined ? style : { ...style, ["--cols" as string]: String(cols) };
  return createElement(as, { className: cx("g95-grid", className), style: gapStyle(gap, s), ...rest });
}

export type Background = "stars" | "tile" | "teal" | "bliss" | "note" | "paper" | "dither";

export type PanelProps = BoxProps & {
  /** Bevel style. `raised` is a grey button-like face, `sunken` a white inset field. */
  bevel?: "raised" | "sunken" | "none";
  /** 4px bevels instead of 2px. */
  chunky?: boolean;
  /** Adds the hard offset drop shadow. */
  pop?: boolean;
  bg?: Background;
  padded?: boolean;
};

export function Panel({ as = "div", bevel = "raised", chunky, pop, bg, padded = true, gap, className, style, ...rest }: PanelProps) {
  return createElement(as, {
    className: cx(
      bevel === "raised" && "g95-raised",
      bevel === "sunken" && "g95-sunken",
      chunky && "g95-chunky",
      pop && "g95-pop",
      bg && `g95-bg-${bg}`,
      padded && "g95-u-p",
      className,
    ),
    style: gapStyle(gap, style),
    ...rest,
  });
}
