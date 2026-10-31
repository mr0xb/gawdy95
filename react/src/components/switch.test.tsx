import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Button, DEFAULT_THEME_STORAGE_KEY, Dialog, GawdyRoot, Switch, ThemeSwitch, type GawdyTheme } from "../index";

function mockSystemTheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: dark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => mq));
  return {
    set(next: boolean) {
      mq.matches = next;
      listeners.forEach((fn) => fn());
    },
  };
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
});

test("Switch toggles on click and keyboard, uncontrolled", async () => {
  const onChange = vi.fn();
  render(<Switch label="Turbo mode" onChange={onChange} />);
  const sw = screen.getByRole("switch", { name: "Turbo mode" });
  expect(sw).toHaveAttribute("aria-checked", "false");
  expect(sw).toHaveClass("g95-switch");

  await userEvent.click(sw);
  expect(sw).toHaveAttribute("aria-checked", "true");
  expect(onChange).toHaveBeenLastCalledWith(true);

  sw.focus();
  await userEvent.keyboard(" ");
  expect(sw).toHaveAttribute("aria-checked", "false");
  await userEvent.keyboard("{Enter}");
  expect(sw).toHaveAttribute("aria-checked", "true");
});

test("Switch is controllable and respects disabled", async () => {
  function Harness() {
    const [on, setOn] = useState(true);
    return <Switch aria-label="Sound" size="sm" checked={on} onChange={setOn} />;
  }
  render(<><Harness /><Switch label="Locked" disabled /></>);
  const sound = screen.getByRole("switch", { name: "Sound" });
  expect(sound).toHaveClass("g95-switch--sm");
  expect(sound).toHaveAttribute("aria-checked", "true");
  await userEvent.click(sound);
  expect(sound).toHaveAttribute("aria-checked", "false");

  const locked = screen.getByRole("switch", { name: "Locked" });
  await userEvent.click(locked);
  expect(locked).toHaveAttribute("aria-checked", "false");
});

test("ThemeSwitch inside GawdyRoot flips body.g95-dark and remembers the pick", async () => {
  const { unmount } = render(<GawdyRoot><ThemeSwitch /></GawdyRoot>);
  const sw = screen.getByRole("switch", { name: "Dark mode" });
  expect(sw).toHaveClass("g95-switch--theme");
  expect(sw).toHaveTextContent("☀️");
  expect(document.body).toHaveClass("g95");
  expect(document.body).not.toHaveClass("g95-dark");

  await userEvent.click(sw);
  expect(sw).toHaveAttribute("aria-checked", "true");
  expect(sw).toHaveTextContent("🌙");
  expect(document.body).toHaveClass("g95-dark");
  expect(localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBe("dark");

  unmount();
  expect(document.body).not.toHaveClass("g95-dark");
  render(<GawdyRoot><ThemeSwitch label={null} /></GawdyRoot>);
  expect(document.body).toHaveClass("g95-dark");
  expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute("aria-checked", "true");
});

test("scoped GawdyRoot puts g95-dark on its wrapper and on dialogs it portals", async () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <GawdyRoot mode="scope" data-testid="scope" themeStorageKey={null}>
        <ThemeSwitch />
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Hi">Night!</Dialog>
      </GawdyRoot>
    );
  }
  render(<Harness />);
  await userEvent.click(screen.getByRole("switch", { name: "Dark mode" }));
  expect(screen.getByTestId("scope")).toHaveClass("g95", "g95-dark");
  expect(document.body).not.toHaveClass("g95-dark");
  expect(localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBeNull();

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog", { name: "Hi" }).closest(".g95")).toHaveClass("g95-dark");
});

test("defaultTheme system follows the OS until the user picks", async () => {
  const os = mockSystemTheme(true);
  render(<GawdyRoot defaultTheme="system"><ThemeSwitch /></GawdyRoot>);
  const sw = screen.getByRole("switch", { name: "Dark mode" });
  expect(sw).toHaveAttribute("aria-checked", "true");
  expect(document.body).toHaveClass("g95-dark");

  os.set(false);
  expect(await screen.findByRole("switch", { checked: false })).toBe(sw);

  await userEvent.click(sw);
  os.set(false);
  expect(sw).toHaveAttribute("aria-checked", "true");
});

test("controlled ThemeSwitch works outside a GawdyRoot", async () => {
  const seen: GawdyTheme[] = [];
  function Harness() {
    const [theme, setTheme] = useState<GawdyTheme>("dark");
    return <ThemeSwitch theme={theme} onChange={(t) => { seen.push(t); setTheme(t); }} />;
  }
  render(<Harness />);
  const sw = screen.getByRole("switch", { name: "Dark mode" });
  expect(sw).toHaveAttribute("aria-checked", "true");
  await userEvent.click(sw);
  expect(sw).toHaveAttribute("aria-checked", "false");
  expect(seen).toEqual(["light"]);
});
