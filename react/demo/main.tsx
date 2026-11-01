import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AcmeApp } from "./AcmeApp";
import "./demo.css";
import {
  Alert,
  Auto,
  Badge,
  Button,
  ButtonRow,
  Checkbox,
  Construction,
  Counter,
  DesktopIcon,
  DesktopIcons,
  Dialog,
  Field,
  Form,
  GawdyMode,
  GawdyModeProvider,
  GawdyUiSwitch,
  Grid,
  Groove,
  Input,
  Led,
  ListBox,
  Marquee,
  Note,
  Progress,
  RainbowBar,
  Radio,
  Range,
  Select,
  Stack,
  Stamp,
  Starburst,
  Switch,
  Table,
  Tabs,
  Tape,
  Taskbar,
  ThemeSwitch,
  TextArea,
  Tree,
  Window,
  WordArt,
  Wrap,
  type WordArtFill,
} from "../src";

const FILLS: WordArtFill[] = ["purple", "cyan", "red", "white", "outline", "rainbow", "chrome", "fire", "slime", "gold"];

function GawdyApp() {
  const [dialog, setDialog] = useState(false);
  const [hunger, setHunger] = useState(70);
  const [picked, setPicked] = useState<string | null>("Grukk Stonejaw");
  const [dragOpen, setDragOpen] = useState(true);

  return (
    <>
      <Wrap>
        <Stack gap={28}>
          <header className="g95-u-center g95-u-rel">
            <Starburst color="red" corner style={{ right: "4%" }}>100% Gawdy!</Starburst>
            <WordArt as="h1" fill="purple" size="xl" motion="wobble">Gawdy 95</WordArt>
            <br />
            <WordArt as="h2" fill="rainbow" size="sm" shape="tilt" className="g95-u-mt">Now in React. Still ugly.</WordArt>
            <RainbowBar thick className="g95-u-mt" />
            <Marquee className="g95-u-mt">*** WELCOME TO THE INFORMATION SUPERHIGHWAY *** BEST VIEWED IN 800x600 *** NOW WITH 100% MORE COMPONENTS ***</Marquee>
          </header>

          <Window pop icon="🅰️" title="wordart.exe" controls={["min", "max", "close"]} menu={["Fill", "Shape", "Help"]} bodyClassName="g95-bg-stars g95-u-center" status={[`${FILLS.length + 5} object(s)`, <>Compose: <code>{"<WordArt fill size shape motion>"}</code></>]}>
            <Auto gap={30}>
              {FILLS.map((f) => <WordArt key={f} fill={f} size="md">{f}</WordArt>)}
              <WordArt fill="purple" size="md" shape="fan">fan</WordArt>
              <WordArt fill="cyan" size="md" shape="steep">steep</WordArt>
              <WordArt fill="fire" size="md" shape="stretch">stretch</WordArt>
              <WordArt fill="rainbow" size="md" motion="hue">hue</WordArt>
              <WordArt fill="gold" size="md" motion="pulse">pulse</WordArt>
            </Auto>
          </Window>

          <Tape />

          <Grid>
            <Window icon="📝" title="Sign Up - Wizard" controls={["help", "close"]}>
              <Form onSubmit={(e) => e.preventDefault()}>
                <Field label="Your name:"><Input defaultValue="Sir Charles of St Cheese" /></Field>
                <Field label="Region:"><Select options={["us-east-1", "us-west-2", "eu-west-1"]} /></Field>
                <Field label="Message:"><TextArea defaultValue="Please send nuggies." /></Field>
                <Groove legend="Nugget style">
                  <Radio name="style" label="Dino-shaped" defaultChecked />
                  <br />
                  <Radio name="style" label="Blob (ew)" />
                </Groove>
                <Checkbox label="Subscribe to nugget-letter" defaultChecked />
                <Switch label="Turbo nuggets" defaultChecked />
                <Field label={`Hunger: ${hunger}%`}><Range value={hunger} onChange={(e) => setHunger(Number(e.target.value))} /></Field>
                <Progress value={hunger} label="Hunger" />
                <Progress animated rainbow label="Loading" />
                <ButtonRow>
                  <Button type="submit" variant="default">OK</Button>
                  <Button>Cancel</Button>
                  <Button disabled>Apply</Button>
                  <Button variant="rainbow" onClick={() => setDialog(true)}>Alert!</Button>
                </ButtonRow>
              </Form>
            </Window>

            <Window icon="📊" title="estimate.xls - Excel" controls={["min", "close"]} status={["Ready", "CAP", "NUM"]}>
              <Tabs
                label="Views"
                tabs={[
                  {
                    id: "table",
                    label: "Table",
                    content: (
                      <Table
                        sheet
                        columns={[{ key: "n", header: "" }, { key: "m", header: "Milestone" }, { key: "goal", header: "Goal" }, { key: "weeks", header: "Weeks", numeric: true }]}
                        rows={[
                          { n: 1, m: "M0", goal: "Test run", weeks: 6 },
                          { n: 2, m: "M1", goal: "Blip < 30 s", weeks: 14 },
                          { n: 3, m: "M2", goal: "TRUE ZERO!!", weeks: 18 },
                        ]}
                      />
                    ),
                  },
                  {
                    id: "list",
                    label: "List",
                    content: (
                      <Stack gap={8}>
                        <ListBox label="Crew" items={["Grukk Stonejaw", "Brokk Nuggetbeard", "Sir Charles of St Cheese"]} value={picked} onChange={setPicked} onActivate={() => setDialog(true)} />
                        <span className="g95-u-sm">Selected: {picked ?? "nobody"} (double-click or Enter to open)</span>
                      </Stack>
                    ),
                  },
                  {
                    id: "tree",
                    label: "Tree",
                    content: <Tree nodes={[{ label: "C:\\", children: [{ label: "Nuggets", children: [{ label: "dino.exe" }, { label: "blob.exe" }] }, { label: "autoexec.bat" }] }]} />,
                  },
                ]}
              />
            </Window>
          </Grid>

          <Grid cols={3}>
            <Note>Sticky note.<br />Remember to buy nuggies.</Note>
            <Alert glyph="⛔"><b>DANGER.TXT</b><br />Never click “Destroy”.</Alert>
            <div className="g95-u-center">
              <Stamp>Not good</Stamp>
              <br />
              <Badge>New!</Badge> <Construction />
            </div>
          </Grid>

          <div className="g95-u-center g95-u-white g95-u-shadow">
            You are visitor number
            <br />
            <Counter value={1337} />
            <br />
            <Led /> online <Led color="red" /> busy <Led color="off" /> idle
          </div>

          <DesktopIcons>
            <DesktopIcon icon="💻" label="My Computer" onOpen={() => setDialog(true)} />
            <DesktopIcon icon="🗑️" label="Recycle Bin" />
            <DesktopIcon icon="🌐" label="The Internet" />
            <DesktopIcon icon="🦖" label="dino.exe" onOpen={() => setDragOpen(true)} />
          </DesktopIcons>
        </Stack>
      </Wrap>

      {dragOpen && (
        <Window pop draggable notepad icon="🖱️" title="Drag me" controls={["close"]} onClose={() => setDragOpen(false)} style={{ position: "fixed", width: 300, zIndex: 50 }} defaultPosition={{ x: 24, y: 120 }}>
          Pass <code>draggable</code> to any <code>{"<Window>"}</code>. Double-click dino.exe to bring me back.
        </Window>
      )}

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Error"
        glyph="❌"
        actions={
          <>
            <Button variant="default" onClick={() => setDialog(false)}>OK</Button>
            <Button onClick={() => setDialog(false)}>Cancel</Button>
          </>
        }
      >
        A fatal exception 0E has occurred at 0028:C0011E36. Continue anyway?
      </Dialog>

      <Taskbar
        startItems={[
          { label: "Programs", icon: "🗂️" },
          { label: "Documents", icon: "📄" },
          { label: "Settings", icon: "⚙️" },
          "separator",
          { label: "Shut Down…", icon: "🔌", onSelect: () => setDialog(true) },
        ]}
        tasks={[{ id: "demo", label: "Gawdy 95", active: true }]}
        tray={<><ThemeSwitch size="sm" label={null} /><span aria-hidden="true">🔊</span></>}
      />
    </>
  );
}

function App() {
  return (
    <GawdyModeProvider>
      <div className="demo-bar">
        <GawdyUiSwitch customLabel="Acme" />
      </div>
      <GawdyMode custom={<AcmeApp />} gawdy={<GawdyApp />} />
    </GawdyModeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
