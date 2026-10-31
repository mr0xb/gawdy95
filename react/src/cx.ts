import type { CSSProperties } from "react";


export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function gapStyle(gap: number | string | undefined, style?: CSSProperties): CSSProperties | undefined {
  if (gap === undefined) return style;
  return { ...style, ["--g" as string]: typeof gap === "number" ? `${gap}px` : gap };
}
