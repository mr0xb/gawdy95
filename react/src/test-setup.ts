import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  document.body.className = "";
});

// jsdom has no PointerEvent, so fireEvent.pointer* would drop button/clientX. MouseEvent carries them.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {}
  Object.defineProperty(window, "PointerEvent", { value: PointerEventPolyfill, configurable: true });
}
