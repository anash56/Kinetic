import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { PageTitle } from "../components/ui/PageTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { api } from "../lib/api";
import { money } from "../utils/format";

export function TransactionsPage({ items, reload }) {
  const [modal, setModal] = useState(false);
  const [sourceModal, setSourceModal] = useState(false);
  const [sourceForm, setSourceForm] = useState({ name: "", amount: "", frequency: "MONTHLY" });
  const [categories, setCategories] = useState(["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Healthcare", "Education", "Savings", "Investments", "Subscriptions", "Other"]);
  const [sources, setSources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "EXPENSE",
    amount: "",
    category: "Food",
    note: "",
    date: new Date().toISOString().slice(0, 10),
    sourceId: "",
  });

  useEffect(() => {
    api("/categories").then(setCategories).catch(() => {});
    api("/income-sources").then(setSources).catch(() => {});
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { type: form.type, amount: form.amount, category: form.category, note: form.note, date: form.date };
      if (form.type === "INCOME" && form.sourceId) body.sourceId = form.sourceId;
      await api("/transactions", { method: "POST", body: JSON.stringify(body) });
      setModal(false);
      reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const remove = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await api(`/transactions/${id}`, { method: "DELETE" });
    reload();
  };
  const updateSource = (event) => setSourceForm({ ...sourceForm, [event.target.name]: event.target.value });
  const saveSource = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/income-sources", { method: "POST", body: JSON.stringify(sourceForm) });
      setSourceModal(false);
      setSourceForm({ name: "", amount: "", frequency: "MONTHLY" });
      setSources(await api("/income-sources"));
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const monthLabel = now.toLocaleString("en", { month: "long", year: "numeric" });
  const monthTransactions = items.filter((i) => {
    const d = new Date(i.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome = monthTransactions.filter((i) => i.type === "INCOME").reduce((a, i) => a + Number(i.amount), 0);
  const monthExpense = monthTransactions.filter((i) => i.type === "EXPENSE").reduce((a, i) => a + Number(i.amount), 0);

  return (
    <>
      <PageTitle
        title="Transactions"
        sub="Track every rupee in and out."
        action={
          <button className="primary small" onClick={() => setModal(true)}>
            <Plus /> Add transaction
          </button>
        }
      />
      <section className="stats compact">
        <div className="card stat">
          <span>This month</span>
          <strong>{monthLabel}</strong>
        </div>
        <div className="card stat">
          <span>Income</span>
          <strong className="positive">{money(monthIncome)}</strong>
        </div>
        <div className="card stat">
          <span>Spending</span>
          <strong className="negative">{money(monthExpense)}</strong>
        </div>
        <div className="card stat">
          <span>Net</span>
          <strong>{money(monthIncome - monthExpense)}</strong>
        </div>
      </section>
      <section className="card table">
        <div className="between">
          <div>
            <h3>Income sources</h3>
            <p>Add recurring income like salary, freelancing, or rent.</p>
          </div>
          <button className="link" onClick={() => setSourceModal(true)}>Add source +</button>
        </div>
        {sources.length ? (
          <div className="asset-list">
            {sources.map((source) => (
              <div className="row" key={source.id}>
                <span className="circle">↓</span>
                <div>
                  <b>{source.name}</b>
                  <small>{source.frequency.toLowerCase()} income</small>
                </div>
                <b className="positive">{money(source.amount)}</b>
                <button className="icon-action danger" title="Delete income source" onClick={async () => { if (!window.confirm(`Remove ${source.name}?`)) return; await api(`/income-sources/${source.id}`, { method: "DELETE" }); const next = await api("/income-sources"); setSources(next); }}><Trash2 /></button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Add a regular income source to see it here." action={() => setSourceModal(true)} />
        )}
      </section>
      <section className="card table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Type</th>
              <th>Amount</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>
                  <b>{item.category}</b>
                  {item.source?.name && <small className="muted"> · {item.source.name}</small>}
                </td>
                <td>{item.note || "—"}</td>
                <td>
                  <span className={`tag ${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                </td>
                <td className={item.type === "INCOME" ? "positive" : "negative"}>
                  {item.type === "INCOME" ? "+" : "-"}
                  {money(item.amount)}
                </td>
                <td><button className="icon-action danger" title="Delete transaction" onClick={() => remove(item.id)}><Trash2 /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <EmptyState text="No transactions yet. Add your first income or expense." />
        )}
      </section>
      {modal && (
        <Modal title="Add transaction" onClose={() => setModal(false)}>
          <form onSubmit={save} className="form">
            <label>
              Type
              <select name="type" value={form.type} onChange={update}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </label>
            <label>
              Amount (₹)
              <input name="amount" required type="number" min="1" value={form.amount} onChange={update} />
            </label>
            <label>
              Category
              <input
                name="category"
                required
                list="category-list"
                value={form.category}
                onChange={update}
              />
              <datalist id="category-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            {form.type === "INCOME" && sources.length > 0 && (
              <label>
                Income source (optional)
                <select name="sourceId" value={form.sourceId} onChange={update}>
                  <option value="">No source</option>
                  {sources.map((s) => <option key={s.id} value={s.id}>{s.name} · {money(s.amount)}/{s.frequency.toLowerCase()}</option>)}
                </select>
              </label>
            )}
            <label>
              Date
              <input name="date" required type="date" value={form.date} onChange={update} />
            </label>
            <label className="full">
              Note (optional)
              <input name="note" value={form.note} onChange={update} />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="primary" disabled={saving}>{saving ? "Saving…" : "Save transaction"}</button>
          </form>
        </Modal>
      )}
      {sourceModal && (
        <Modal title="Add income source" onClose={() => setSourceModal(false)}>
          <form onSubmit={saveSource} className="form">
            <label className="full">
              Source name
              <input name="name" required placeholder="Salary, freelancing, rent…" value={sourceForm.name} onChange={updateSource} />
            </label>
            <label>
              Amount (₹)
              <input name="amount" required type="number" min="1" value={sourceForm.amount} onChange={updateSource} />
            </label>
            <label>
              Frequency
              <select name="frequency" value={sourceForm.frequency} onChange={updateSource}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </label>
            <button className="primary" disabled={saving}>{saving ? "Saving…" : "Add income source"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export default TransactionsPage;