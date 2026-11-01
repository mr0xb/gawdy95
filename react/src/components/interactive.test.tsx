import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Button, Dialog, Field, GawdyRoot, Input, ListBox, Select, Tabs, Taskbar, Window } from "../index";

test("Window minimizes, maximizes and closes", async () => {
  render(<Window title="hello.exe" icon="👋" controls={["min", "max", "close"]} status={["Ready", "NUM"]}>Body</Window>);
  const win = screen.getByRole("region", { name: "hello.exe" });
  expect(win).toHaveClass("g95-window");
  expect(screen.getByText("Ready")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "Minimize" }));
  expect(win).toHaveClass("is-min");
  await userEvent.click(screen.getByRole("button", { name: "Restore" }));
  expect(win).not.toHaveClass("is-min");

  await userEvent.click(screen.getByRole("button", { name: "Maximize" }));
  expect(win).toHaveClass("is-max");

  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(win).toHaveClass("is-closed");
});

test("Window calls onClose instead of hiding when given, and underlines menu access keys", async () => {
  const onClose = vi.fn();
  render(<Window title="w" controls={["close"]} onClose={onClose} menu={["File", { label: "Help", accessKey: 1 }]}>x</Window>);
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(screen.getByRole("region", { name: "w" })).not.toHaveClass("is-closed");
  expect(screen.getByText("F").tagName).toBe("U");
  expect(screen.getByText("e").tagName).toBe("U");
});

test("draggable Window moves with the pointer", () => {
  render(<Window title="drag me" draggable defaultPosition={{ x: 10, y: 20 }}>x</Window>);
  const win = screen.getByRole("region", { name: "drag me" });
  expect(win).toHaveAttribute("data-g95-drag");
  expect(win).toHaveStyle({ left: "10px", top: "20px" });
  fireEvent.pointerDown(screen.getByText("drag me"), { button: 0, clientX: 15, clientY: 25 });
  fireEvent.pointerMove(window, { clientX: 115, clientY: 75 });
  fireEvent.pointerUp(window);
  expect(win).toHaveStyle({ left: "100px", top: "50px" });
});

test("Tabs switch on click and with arrow keys", async () => {
  render(
    <Tabs
      label="Views"
      tabs={[
        { id: "a", label: "Table", content: "table panel" },
        { id: "b", label: "List", content: "list panel" },
        { id: "c", label: "Tree", content: "tree panel" },
      ]}
    />,
  );
  expect(screen.getByRole("tabpanel")).toHaveTextContent("table panel");
  await userEvent.click(screen.getByRole("tab", { name: "List" }));
  expect(screen.getByRole("tab", { name: "List" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tabpanel")).toHaveTextContent("list panel");

  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Tree" })).toHaveFocus();
  expect(screen.getByRole("tabpanel")).toHaveTextContent("tree panel");
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Table" })).toHaveAttribute("aria-selected", "true");
});

test("ListBox selects by click and keyboard, activates on Enter and double-click", async () => {
  const onActivate = vi.fn();
  render(<ListBox label="People" items={["Grukk", "Brokk", { value: "charles", label: "Sir Charles" }]} onActivate={onActivate} />);
  const list = screen.getByRole("listbox", { name: "People" });

  await userEvent.click(screen.getByRole("option", { name: "Brokk" }));
  expect(screen.getByRole("option", { name: "Brokk" })).toHaveAttribute("aria-selected", "true");

  list.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("option", { name: "Sir Charles" })).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{Enter}");
  expect(onActivate).toHaveBeenLastCalledWith("charles");

  await userEvent.dblClick(screen.getByRole("option", { name: "Grukk" }));
  expect(onActivate).toHaveBeenLastCalledWith("Grukk");
});

test("Taskbar Start menu opens, runs an item, and closes on outside click and Escape", async () => {
  const onSelect = vi.fn();
  render(
    <>
      <p>outside</p>
      <Taskbar brand="Runbooks 95" startItems={[{ label: "Programs", icon: "🗂️", onSelect }, "separator", { label: "Docs", href: "#docs" }]} tasks={[{ id: "t", label: "Gawdy 95", active: true }]} />
    </>,
  );
  const start = screen.getByRole("button", { name: "Start" });
  expect(screen.getByRole("button", { name: "Gawdy 95" })).toHaveClass("is-pressed");
  expect(screen.queryByText("Programs")).toBeNull();

  await userEvent.click(start);
  expect(start).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "#docs");
  expect(document.querySelector(".g95-menu")).toHaveStyle({ "--g95-menu-brand": '"Runbooks 95"' });
  await userEvent.click(screen.getByRole("button", { name: /Programs/ }));
  expect(onSelect).toHaveBeenCalledOnce();
  expect(screen.queryByText("Programs")).toBeNull();

  await userEvent.click(start);
  await userEvent.click(screen.getByText("outside"));
  expect(screen.queryByText("Programs")).toBeNull();

  await userEvent.click(start);
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByText("Programs")).toBeNull();
  expect(start).toHaveFocus();
});

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Error" glyph="❌" actions={<><Button variant="default" onClick={() => setOpen(false)}>OK</Button><Button>Cancel</Button></>}>
        A fatal exception 0E has occurred.
      </Dialog>
    </>
  );
}

test("Dialog focuses its first action, traps Tab, closes on Escape and restores focus", async () => {
  render(<DialogHarness />);
  expect(screen.queryByRole("dialog")).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Open" }));

  const dialog = screen.getByRole("dialog", { name: "Error" });
  expect(dialog).toHaveTextContent("A fatal exception 0E has occurred.");
  expect(screen.getByRole("button", { name: "OK" })).toHaveFocus();
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
});

test("Field links its label to the control", async () => {
  render(
    <>
      <Field label="Your name"><Input /></Field>
      <Field label="Region"><Select options={["us-east-1", { value: "eu", label: "eu-west-1" }]} defaultValue="eu" /></Field>
    </>,
  );
  await userEvent.type(screen.getByLabelText("Your name"), "Sir Charles");
  expect(screen.getByLabelText("Your name")).toHaveValue("Sir Charles");
  expect(screen.getByLabelText("Region")).toHaveValue("eu");
});

test("GawdyRoot sets body.g95 while mounted, or scopes to a div", () => {
  const { unmount } = render(<GawdyRoot><p>hi</p></GawdyRoot>);
  expect(document.body).toHaveClass("g95");
  unmount();
  expect(document.body).not.toHaveClass("g95");

  const { container } = render(<GawdyRoot mode="scope"><p>hi</p></GawdyRoot>);
  expect(document.body).not.toHaveClass("g95");
  expect(container.firstChild).toHaveClass("g95");
});
