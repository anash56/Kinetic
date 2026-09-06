export function Stat({ label, value, icon }) {
  return <section className="card stat"><span>{label}</span><i>{icon}</i><strong>{value}</strong><small>Updated from your records</small></section>;
}
