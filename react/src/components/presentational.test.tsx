import { render, screen } from "@testing-library/react";
import { Alert, Button, Counter, Grid, Panel, Progress, Stack, Starburst, Table, Tree, WordArt } from "../index";

test("Button maps variants to classes and renders links", () => {
  render(
    <>
      <Button variant="rainbow" big block>Alert!</Button>
      <Button href="#new" variant="default">New</Button>
    </>,
  );
  const btn = screen.getByRole("button", { name: "Alert!" });
  expect(btn).toHaveClass("g95-btn", "g95-btn--rainbow", "g95-btn--big", "g95-btn--block");
  expect(btn).toHaveAttribute("type", "button");
  expect(screen.getByRole("link", { name: "New" })).toHaveClass("g95-btn", "g95-btn--default");
});

test("WordArt composes fill, size, shape and motion", () => {
  render(<WordArt as="h1" fill="rainbow" size="xl" shape="tilt" motion="wobble">Gawdy 95</WordArt>);
  expect(screen.getByRole("heading", { name: "Gawdy 95" })).toHaveClass("wa", "wa-rainbow", "wa-xl", "wa-tilt", "wa-wobble");
});

test("Progress clamps its value and exposes it to assistive tech", () => {
  render(<Progress value={140} rainbow label="Hunger" />);
  const bar = screen.getByRole("progressbar", { name: "Hunger" });
  expect(bar).toHaveAttribute("aria-valuenow", "100");
  expect(bar).toHaveClass("g95-progress--rainbow");
  expect(bar).toHaveStyle({ "--p": "100%" });
});

test("Counter zero-pads digits", () => {
  render(<Counter value={1337} />);
  const counter = screen.getByRole("img", { name: "1337" });
  expect([...counter.querySelectorAll("b")].map((b) => b.textContent).join("")).toBe("001337");
});

test("Table renders columns and rows", () => {
  render(
    <Table
      sheet
      columns={[{ key: "n", header: "" }, { key: "goal", header: "Goal" }, { key: "weeks", header: "Weeks", numeric: true }]}
      rows={[{ n: 1, goal: "Test run", weeks: 6 }, { n: 2, goal: "TRUE ZERO!!", weeks: 18 }]}
    />,
  );
  expect(screen.getByRole("table")).toHaveClass("g95-table", "g95-table--sheet");
  expect(screen.getByRole("cell", { name: "18" })).toHaveClass("is-num");
  expect(screen.getAllByRole("row")).toHaveLength(3);
});

test("Tree marks leaves as files", () => {
  render(<Tree nodes={[{ label: "C:\\", children: [{ label: "Nuggets", children: [{ label: "dino.exe" }] }, { label: "autoexec.bat" }] }]} />);
  expect(screen.getByText("dino.exe")).toHaveClass("is-file");
  expect(screen.getByText("Nuggets", { exact: false }).closest("li")).not.toHaveClass("is-file");
});

test("layout helpers set the gap and column custom properties", () => {
  render(
    <>
      <Stack gap={28} data-testid="stack" />
      <Grid cols={3} gap="1rem" data-testid="grid" />
      <Panel bevel="sunken" bg="stars" pop data-testid="panel" />
    </>,
  );
  expect(screen.getByTestId("stack")).toHaveStyle({ "--g": "28px" });
  expect(screen.getByTestId("grid")).toHaveStyle({ "--cols": "3", "--g": "1rem" });
  expect(screen.getByTestId("panel")).toHaveClass("g95-sunken", "g95-bg-stars", "g95-pop", "g95-u-p");
});

test("Alert and Starburst variants", () => {
  render(
    <>
      <Alert tone="warn" glyph="⚠️">Careful</Alert>
      <Starburst color="red" large corner>100% Gawdy!</Starburst>
    </>,
  );
  expect(screen.getByRole("alert")).toHaveClass("g95-alert", "g95-alert--warn");
  expect(screen.getByText("100% Gawdy!")).toHaveClass("g95-starburst--red", "g95-starburst--lg", "g95-corner");
});
