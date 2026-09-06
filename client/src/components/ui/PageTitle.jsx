export function PageTitle({ title, sub, action }) {
  return <header className="title"><div><h1>{title}</h1><p>{sub}</p></div>{action}</header>;
}
