# gawdy95-react

Typed React components for [Gawdy95](../README.md), the Windows 95 + WordArt CSS framework. The components render Gawdy95's own class names, so the root `gawdy95.css` stays the single source of styling. Everything `gawdy95.js` does (window buttons, dragging, Start menu, tabs, list selection, modals, clock, hit counter) is reimplemented as React state, with keyboard support and ARIA. The vanilla script is not used.

## Install

The package is not published to npm yet (see [License](#license)). Build it and install it from a local path:

```sh
cd react
pnpm install
pnpm build
# in your app
pnpm add /path/to/gawdy95/react
```

React 18 or newer is a peer dependency.

## Quick start

```tsx
import "gawdy95-react/style.css";
import { Button, GawdyRoot, Taskbar, Window, WordArt } from "gawdy95-react";

export function App() {
  return (
    <GawdyRoot>
      <WordArt as="h1" fill="rainbow" size="lg" shape="tilt">Hello</WordArt>
      <Window pop icon="👋" title="hello.exe" controls={["min", "max", "close"]} status={["Ready"]}>
        <Button variant="default">OK</Button>
      </Window>
      <Taskbar startItems={[{ label: "Programs", icon: "🗂️" }, "separator", { label: "Shut Down…", icon: "🔌" }]} />
    </GawdyRoot>
  );
}
```

## Switch between your UI and Gawdy95

`<GawdyModeSwitch>` is a Gawdy95 light/dark switch whose light side (☀️) is your app's own UI and whose dark side (🌙) is Gawdy95:

```tsx
import "gawdy95-react/style.css";
import { GawdyMode, GawdyModeProvider, GawdyModeSwitch } from "gawdy95-react";

<GawdyModeProvider>
  <header><GawdyModeSwitch /></header>
  <GawdyMode custom={<MyApp />} gawdy={<MyGawdyApp />} />
</GawdyModeProvider>
```

- **Your UI stays untouched:** in custom mode `<body>` has no Gawdy95 classes. In Gawdy mode the provider adds `g95`, plus `g95-dark` because the Gawdy side defaults to the dark theme. Pass `defaultGawdyTheme="light"` for classic grey. A `<ThemeSwitch>` inside the Gawdy UI can still flip it.
- **Choice and default:** the pick is remembered under `g95-ui-mode`; pass `storageKey={null}` to forget it. `defaultMode` is `custom`, `gawdy`, or `system`, where a dark OS starts in Gawdy95.
- **Reading the mode:** `useGawdyMode()` gives `{ mode, isGawdy, setMode, toggle }` for anything else that depends on it.
- **Where to put the switch:** render it somewhere both UIs share, such as a top bar, so it keeps focus when the page swaps. It also works on its own (it then manages `<body>` itself), or controlled with `mode` and `onChange`.
- **No `GawdyRoot` needed:** don't nest `<GawdyRoot>` inside the provider; the provider already does its job.

## Light and dark mode inside Gawdy95

```tsx
<GawdyRoot defaultTheme="system">
  <ThemeSwitch />
</GawdyRoot>
```

`<ThemeSwitch>` is a Win95-style toggle: a blue sky with a sun by day, and a starfield with a moon by night. Inside a `<GawdyRoot>` it needs no props. The root adds `g95-dark` to `<body>` (or to its wrapper in `scope` mode), remembers the pick in `localStorage` under `g95-theme`, and with `defaultTheme="system"` follows the OS until the user picks. Dialogs portalled to `<body>` pick up the theme too.

Other ways to control it:

- `<GawdyRoot theme={theme} onThemeChange={setTheme}>` for a controlled theme.
- `themeStorageKey={null}` to not remember the pick.
- `<ThemeSwitch theme onChange>` on its own, outside any root.
- `useGawdyTheme({ defaultTheme, storageKey })` for the stateful hook by itself.

Without React, add `g95-dark` next to `g95` and the CSS does the rest.

`<GawdyRoot>` puts `g95` on `<body>` while it is mounted, which gives you the desktop background, base font and scoped reset. Use `<GawdyRoot mode="scope">` to wrap a single region in a `div.g95` instead, so Gawdy95 can live inside a larger app. `useGawdyBody(enabled)` is the hook form, handy for a theme switch.

## Components

| Area | Components |
| --- | --- |
| Root | `GawdyRoot`, `useGawdyBody` |
| Layout | `Wrap`, `Stack`, `Row`, `Grid` (`cols`), `Auto`, `Split`, `Panel` (`bevel`, `bg`, `chunky`, `pop`). All take `gap` (sets `--g`) and `as`. |
| Windows | `Window`: `title`, `icon`, `controls={["help","min","max","close"]}`, `onClose`, `menu`, `status`, `notepad`, `active`, `pop`, `chunky`, `draggable` with `defaultPosition` |
| Switches | `Switch` (on/off, `role="switch"`; `checked`/`defaultChecked`/`onChange`, `label`, `size="sm"`, custom `thumb`, `onText`, `offText`), `ThemeSwitch` (`theme`, `onChange`, `label={null}` to hide the text) |
| UI mode | `GawdyModeProvider`, `GawdyModeSwitch` (☀️ your UI / 🌙 Gawdy95), `GawdyMode`, `useGawdyMode` |
| Theme | `useGawdyTheme`, `useGawdyThemeContext`, `GawdyThemeContext`, `usePreference` |
| Buttons | `Button` (`variant`: `normal`, `default`, `ok`, `danger`, `rainbow`, `flat`; `big`, `block`, `pressed`; pass `href` to render a link), `ButtonRow`, `buttonClass()` |
| Forms | `Form` (`inline`), `Field` (links the label to its control automatically), `Label`, `Input`, `TextArea` (`mono`), `Select` (`options`), `Checkbox`, `Radio`, `Range`, `Progress` (`value`, `rainbow`, `animated`), `Groove` |
| Data | `Tabs` (arrow keys, Home and End), `ListBox` (arrow keys, `onActivate` on Enter or double-click), `Tree`, `Table` (data-driven `columns` and `rows`, or your own `<thead>`/`<tbody>`) |
| Desktop | `Desktop`, `DesktopIcons`, `DesktopIcon` (`onOpen`), `Taskbar` (`startItems`, `brand`, `tasks`, `tray`, `clock`), `Logo`, `Clock`, `useClock` |
| Dialogs | `Dialog`: portal, focus trap, Escape and backdrop close, focus restored on close |
| WordArt | `WordArt`: `fill`, `size`, `shape`, `motion`, `as` |
| Extras | `Starburst`, `Badge`, `Blink`, `Stamp`, `Note`, `Alert`, `Tape`, `Construction`, `Marquee`, `Counter`, `Led`, `Banner`, `RainbowBar`, `RainbowText` |

Controlled and uncontrolled: `Tabs` and `ListBox` take `value`/`onChange` or `defaultValue`. `Window` manages its own minimize and maximize state. Its close button hides the window unless you pass `onClose`, in which case you own visibility.

## CSS changes on this branch

These are small fixes to the root `gawdy95.css`, all candidates for upstream:

- `<a class="g95-btn">` keeps button colours instead of link blue and underline.
- The Start menu's side stripe reads `var(--g95-menu-brand, "Gawdy 95")`, so `Taskbar brand="…"` can rename it.
- `.g95-menubar > button` looks like the other menu items, for clickable menu entries.
- Status bar cells truncate with an ellipsis instead of pushing the window wider than a phone screen.
- Hard-coded `#fff` and `#000` on bevels, fields and grey surfaces now use variables: the existing `--g95-light` and `--g95-ink`, plus new `--g95-field`, `--g95-field-ink`, `--g95-field-alt`, `--g95-field-hover` and `--g95-field-focus`. Their defaults equal the old values, and screenshots of the kitchen sink are pixel-identical before and after.
- A dark theme (`.g95-dark`): grey-violet chrome, purple-to-magenta title bars, green-on-black fields and a night desktop.
- A `.g95-switch` component with a `--sm` size and a `--theme` sun/moon variant.

## Development

```sh
pnpm dev         # demo at http://localhost:5173: a plain "Acme" app (your UI) switching to the kitchen sink
pnpm test        # Vitest + Testing Library
pnpm build       # dist/index.js, dist/index.cjs, dist/style.css, dist/types
pnpm build:demo  # static demo in demo-dist/
```

## License

Upstream Gawdy95 has no license file, so `package.json` is marked `private` and `UNLICENSED`. Ask the upstream author to add a license before publishing this package or reusing it outside personal projects.
