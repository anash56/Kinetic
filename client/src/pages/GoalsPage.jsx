import { useState } from 'react'; import { Plus, TrendingUp } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState'; import { Modal } from '../components/ui/Modal'; import { PageTitle } from '../components/ui/PageTitle'; import { Progress } from '../components/ui/Progress'; import { api } from '../lib/api';

export function GoalsPage({ goals, reload }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contributeTo, setContributeTo] = useState(null);
  const [amount, setAmount] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', targetDate: '', icon: '🎯' });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try { await api('/goals', { method: 'POST', body: JSON.stringify(form) }); setModal(false); reload(); }
    finally { setSaving(false); }
  };
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveContribution = async (event) => {
    event.preventDefault();
    const contribution = Number(amount || 0);
    if (contribution <= 0) return;
    const goal = goals.find((g) => g.id === contributeTo);
    if (!goal) return;
    const updated = Number(goal.currentAmount) + contribution;
    await api(`/goals/${contributeTo}`, {
      method: 'PATCH',
      body: JSON.stringify({ currentAmount: String(updated) }),
    });
    setContributeTo(null);
    setAmount('');
    reload();
  };

  return (
    <>
      <PageTitle title="Savings goals" sub="Give every rupee a meaningful purpose." action={<button className="primary small" onClick={() => setModal(true)}><Plus /> New goal</button>} />
      <div className="goals">
        {goals.map((goal) => (
          <section className="card goal" key={goal.id}>
            <span>{goal.icon}</span>
            <div>
              <h3>{goal.name}</h3>
              <Progress goal={goal} />
              <button className="link" onClick={() => { setContributeTo(goal.id); setAmount(''); }}>
                <TrendingUp size={14} /> Add funds
              </button>
            </div>
          </section>
        ))}
      </div>
      {!goals.length && <section className="card"><EmptyState text="Your goals make your savings tangible." action={() => setModal(true)} /></section>}
      {modal && (
        <Modal title="Create savings goal" onClose={() => setModal(false)}>
          <form className="form" onSubmit={save}>
            <label className="full">Goal name<input name="name" required placeholder="Emergency fund" value={form.name} onChange={update} /></label>
            <label>Target amount (₹)<input name="targetAmount" required type="number" min="1" value={form.targetAmount} onChange={update} /></label>
            <label>Already saved (₹)<input name="currentAmount" type="number" min="0" value={form.currentAmount} onChange={update} /></label>
            <label>Target date<input name="targetDate" type="date" value={form.targetDate} onChange={update} /></label>
            <label>Icon<input name="icon" value={form.icon} onChange={update} /></label>
            <button className="primary" disabled={saving}>{saving ? 'Creating…' : 'Create goal'}</button>
          </form>
        </Modal>
      )}
      {contributeTo && (
        <Modal title="Add funds to goal" onClose={() => setContributeTo(null)}>
          <form className="form" onSubmit={saveContribution}>
            <label>Amount to add (₹)<input autoFocus type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
            <button className="primary">Add funds</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export default GoalsPage;