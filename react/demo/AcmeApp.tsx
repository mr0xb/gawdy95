const STATS = [
  { label: "Active users", value: "12,480", delta: "+4.2%" },
  { label: "Revenue", value: "$84.1k", delta: "+1.8%" },
  { label: "Open tickets", value: "37", delta: "-12%" },
];

/** Stand-in for "your own UI": a plain, modern light dashboard with no Gawdy95 classes. */
export function AcmeApp() {
  return (
    <div className="acme">
      <header className="acme-head">
        <h1>Acme Analytics</h1>
        <p>This is your app's own UI. Flip the switch to see it in Gawdy 95.</p>
      </header>
      <section className="acme-stats">
        {STATS.map((s) => (
          <article key={s.label} className="acme-card">
            <span className="acme-label">{s.label}</span>
            <strong className="acme-value">{s.value}</strong>
            <span className={"acme-delta" + (s.delta.startsWith("-") ? " down" : "")}>{s.delta} this week</span>
          </article>
        ))}
      </section>
      <section className="acme-card acme-form">
        <label>
          Workspace name
          <input defaultValue="Acme Corp" />
        </label>
        <button type="button">Save changes</button>
      </section>
    </div>
  );
}
