import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DEFAULT_MODE_STORAGE_KEY, GawdyMode, GawdyModeProvider, GawdyModeSwitch, GawdyUiSwitch, ThemeSwitch, useGawdyMode, type GawdyUiMode } from "../index";

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function App(props: { defaultMode?: GawdyUiMode | "system"; defaultGawdyTheme?: "light" | "dark" }) {
  return (
    <GawdyModeProvider {...props}>
      <header><GawdyModeSwitch /></header>
      <GawdyMode custom={<h1>Acme dashboard</h1>} gawdy={<h1>Gawdy desktop</h1>} />
    </GawdyModeProvider>
  );
}

test("switches between the custom UI (light side) and Gawdy95 (dark side)", async () => {
  render(<App />);
  const sw = screen.getByRole("switch", { name: "Gawdy 95" });
  expect(sw).toHaveAttribute("aria-checked", "false");
  expect(sw).toHaveTextContent("☀️");
  expect(screen.getByRole("heading", { name: "Acme dashboard" })).toBeVisible();
  expect(document.body).not.toHaveClass("g95");

  await userEvent.click(sw);
  expect(sw).toHaveAttribute("aria-checked", "true");
  expect(sw).toHaveTextContent("🌙");
  expect(screen.getByRole("heading", { name: "Gawdy desktop" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Acme dashboard" })).toBeNull();
  expect(document.body).toHaveClass("g95", "g95-dark");
  expect(sw).toHaveFocus();
  expect(localStorage.getItem(DEFAULT_MODE_STORAGE_KEY)).toBe("gawdy");

  await userEvent.keyboard(" ");
  expect(screen.getByRole("heading", { name: "Acme dashboard" })).toBeVisible();
  expect(document.body).not.toHaveClass("g95");
  expect(document.body).not.toHaveClass("g95-dark");
});

test("remembers the pick across reloads", async () => {
  const { unmount } = render(<App />);
  await userEvent.click(screen.getByRole("switch", { name: "Gawdy 95" }));
  unmount();
  expect(document.body).not.toHaveClass("g95");

  render(<App />);
  expect(screen.getByRole("heading", { name: "Gawdy desktop" })).toBeVisible();
  expect(document.body).toHaveClass("g95", "g95-dark");
});

test("the Gawdy side can use the light Gawdy theme, and a ThemeSwitch inside changes it", async () => {
  render(
    <GawdyModeProvider defaultMode="gawdy" defaultGawdyTheme="light" gawdyThemeStorageKey={null}>
      <GawdyModeSwitch label={null} />
      <ThemeSwitch label="Night" />
    </GawdyModeProvider>,
  );
  expect(document.body).toHaveClass("g95");
  expect(document.body).not.toHaveClass("g95-dark");
  await userEvent.click(screen.getByRole("switch", { name: "Night" }));
  expect(document.body).toHaveClass("g95", "g95-dark");
});

test("defaultMode system follows the OS: dark means Gawdy95", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })));
  render(<App defaultMode="system" />);
  expect(screen.getByRole("heading", { name: "Gawdy desktop" })).toBeVisible();
  expect(screen.getByRole("switch", { name: "Gawdy 95" })).toHaveAttribute("aria-checked", "true");
});

test("useGawdyMode exposes the mode and a toggle", async () => {
  function Status() {
    const ctx = useGawdyMode()!;
    return <button type="button" onClick={ctx.toggle}>{ctx.isGawdy ? "in gawdy" : "in custom"}</button>;
  }
  render(<GawdyModeProvider storageKey={null}><Status /></GawdyModeProvider>);
  await userEvent.click(screen.getByRole("button", { name: "in custom" }));
  expect(screen.getByRole("button", { name: "in gawdy" })).toBeVisible();
  expect(localStorage.getItem(DEFAULT_MODE_STORAGE_KEY)).toBeNull();
});

test("standalone switch flips <body> by itself; controlled switch leaves it to the caller", async () => {
  const { unmount } = render(<GawdyModeSwitch storageKey={null} />);
  await userEvent.click(screen.getByRole("switch", { name: "Gawdy 95" }));
  expect(document.body).toHaveClass("g95", "g95-dark");
  unmount();
  expect(document.body).not.toHaveClass("g95");

  const seen: GawdyUiMode[] = [];
  function Controlled() {
    const [mode, setMode] = useState<GawdyUiMode>("custom");
    return <GawdyModeSwitch mode={mode} onChange={(m) => { seen.push(m); setMode(m); }} />;
  }
  render(<Controlled />);
  await userEvent.click(screen.getByRole("switch", { name: "Gawdy 95" }));
  expect(seen).toEqual(["gawdy"]);
  expect(screen.getByRole("switch", { name: "Gawdy 95" })).toHaveAttribute("aria-checked", "true");
  expect(document.body).not.toHaveClass("g95");
});

function TriApp() {
  return (
    <GawdyModeProvider storageKey="ui" gawdyThemeStorageKey="theme">
      <GawdyUiSwitch />
      <GawdyMode custom={<h1>Acme dashboard</h1>} gawdy={<h1>Gawdy desktop</h1>} />
    </GawdyModeProvider>
  );
}

test("GawdyUiSwitch picks your UI, Gawdy light or Gawdy dark", async () => {
  render(<TriApp />);
  const group = screen.getByRole("radiogroup", { name: "Interface" });
  const classic = screen.getByRole("radio", { name: "Classic" });
  const light = screen.getByRole("radio", { name: "Gawdy 95 light" });
  const dark = screen.getByRole("radio", { name: "Gawdy 95 dark" });
  expect(classic).toHaveAttribute("aria-checked", "true");
  expect(group).toHaveTextContent("Classic");
  expect(document.body).not.toHaveClass("g95");

  await userEvent.click(light);
  expect(light).toHaveAttribute("aria-checked", "true");
  expect(screen.getByRole("heading", { name: "Gawdy desktop" })).toBeVisible();
  expect(document.body).toHaveClass("g95");
  expect(document.body).not.toHaveClass("g95-dark");
  expect(group).toHaveAttribute("data-pos", "light");

  await userEvent.click(dark);
  expect(document.body).toHaveClass("g95", "g95-dark");
  expect(localStorage.getItem("ui")).toBe("gawdy");
  expect(localStorage.getItem("theme")).toBe("dark");

  await userEvent.click(classic);
  expect(screen.getByRole("heading", { name: "Acme dashboard" })).toBeVisible();
  expect(document.body).not.toHaveClass("g95");
  expect(localStorage.getItem("ui")).toBe("custom");
});

test("GawdyUiSwitch moves with arrow keys, Home and End, keeping focus", async () => {
  render(<TriApp />);
  screen.getByRole("radio", { name: "Classic" }).focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Gawdy 95 light" })).toHaveFocus();
  expect(document.body).toHaveClass("g95");
  await userEvent.keyboard("{End}");
  expect(screen.getByRole("radio", { name: "Gawdy 95 dark" })).toHaveFocus();
  expect(document.body).toHaveClass("g95-dark");
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Classic" })).toHaveFocus();
  expect(document.body).not.toHaveClass("g95");
  await userEvent.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: "Gawdy 95 dark" })).toHaveAttribute("aria-checked", "true");
});

test("GawdyUiSwitch needs a provider", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<GawdyUiSwitch />)).toThrow(/GawdyModeProvider/);
});

function TwoStopApp() {
  const Back = () => {
    const ctx = useGawdyMode()!;
    return <button type="button" onClick={() => ctx.setMode("custom")}>Back to Classic</button>;
  };
  return (
    <GawdyModeProvider storageKey="ui" gawdyThemeStorageKey="theme">
      <GawdyUiSwitch includeCustom={false} />
      <GawdyMode custom={<h1>Acme dashboard</h1>} gawdy={<><h1>Gawdy desktop</h1><Back /></>} />
    </GawdyModeProvider>
  );
}

test("includeCustom={false} offers only Gawdy light and dark, with nothing selected in your UI", async () => {
  render(<TwoStopApp />);
  const group = screen.getByRole("radiogroup", { name: "Interface" });
  expect(screen.queryByRole("radio", { name: "Classic" })).toBeNull();
  const light = screen.getByRole("radio", { name: "Gawdy 95 light" });
  const dark = screen.getByRole("radio", { name: "Gawdy 95 dark" });
  expect(light).toHaveAttribute("aria-checked", "false");
  expect(dark).toHaveAttribute("aria-checked", "false");
  expect(group).toHaveAttribute("data-unset");
  expect(group).toHaveAccessibleDescription("Classic");
  expect(group.querySelector(".g95-switch__thumb")).toBeNull();
  expect(light).toHaveAttribute("tabindex", "0");

  await userEvent.click(dark);
  expect(document.body).toHaveClass("g95", "g95-dark");
  expect(dark).toHaveAttribute("aria-checked", "true");
  expect(group).not.toHaveAttribute("data-unset");
  expect(group).toHaveAccessibleDescription("Gawdy 95 dark");
  expect(group.querySelector(".g95-switch__thumb")).toHaveTextContent("🌙");

  await userEvent.keyboard("{ArrowLeft}");
  expect(light).toHaveFocus();
  expect(document.body).not.toHaveClass("g95-dark");

  await userEvent.click(screen.getByRole("button", { name: "Back to Classic" }));
  expect(document.body).not.toHaveClass("g95");
  expect(screen.getByRole("heading", { name: "Acme dashboard" })).toBeVisible();
  expect(light).toHaveAttribute("aria-checked", "false");
  expect(localStorage.getItem("ui")).toBe("custom");
});

test("includeCustom={false}: arrow keys from your UI enter Gawdy", async () => {
  render(<TwoStopApp />);
  screen.getByRole("radio", { name: "Gawdy 95 light" }).focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: "Gawdy 95 dark" })).toHaveFocus();
  expect(document.body).toHaveClass("g95", "g95-dark");
});
