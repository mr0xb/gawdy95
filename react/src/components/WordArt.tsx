import { createElement, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../cx";

export type WordArtFill = "purple" | "cyan" | "red" | "white" | "outline" | "rainbow" | "chrome" | "fire" | "slime" | "gold";
export type WordArtSize = "sm" | "md" | "lg" | "xl";
export type WordArtShape = "flat" | "tilt" | "tilt-r" | "steep" | "fan" | "fan-r" | "stretch" | "squish" | "arc";
export type WordArtMotion = "wobble" | "pulse" | "spin" | "hue";

export type WordArtProps = HTMLAttributes<HTMLElement> & {
  /** Element to render, e.g. `h1`. Default `span`. */
  as?: ElementType;
  fill?: WordArtFill;
  size?: WordArtSize;
  shape?: WordArtShape;
  /** `hue` replaces the drop-shadow extrusion on gradient fills (an element has only one `filter`). */
  motion?: WordArtMotion;
};

/** Extruded, stroked 90s WordArt text. */
export function WordArt({ as = "span", fill = "purple", size, shape, motion, className, ...rest }: WordArtProps) {
  return createElement(as, {
    className: cx("wa", `wa-${fill}`, size && `wa-${size}`, shape && `wa-${shape}`, motion && `wa-${motion}`, className),
    ...rest,
  });
}
