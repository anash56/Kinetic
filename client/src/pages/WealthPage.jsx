import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Plus, ReceiptText, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { PageTitle } from '../components/ui/PageTitle';
import { Stat } from '../components/ui/Stat';
import { api } from '../lib/api';
import { formatMonth, money } from '../utils/format';

export function WealthPage({ data, reload }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Investment', value: '' });
  const savingsRate = data.income ? Math.max(0, Math.round((data.savings / data.income) * 100)) : 0;
  const save = async (event) => { event.preventDefault(); await api('/assets', { method: 'POST', body: JSON.stringify(form) }); setModal(false); setForm({ name: '', type: 'Investment', value: '' }); reload(); };
  const remove = async (id) => { if (!window.confirm('Delete this asset?')) return; await api(`/assets/${id}`, { method: 'DELETE' }); reload(); };
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const historyPoints = (data.wealthHistory?.length || 0) > 1
    ? data.wealthHistory.map((p) => ({ month: formatMonth(p.date), value: p.value }))
    : [{ month: new Date().toLocaleString('en', { month: 'short' }), value: data.netWorth }];

  const monthlyNet = data.monthly?.map((m) => ({
    month: m.month,
    net: m.net,
    income: m.income,
    expenses: m.expenses,
  })) || [];

  return (
    <>
      <PageTitle title="Wealth analytics" sub="A complete view of your financial progress." action={<button className="primary small" onClick={() => setModal(true)}><Plus /> Add asset</button>} />
      <section className="wealth">
        <div><small>YOUR CURRENT NET WORTH</small><h1>{money(data.netWorth)}</h1><p>Available savings plus tracked assets</p></div>
        <div><span>Income</span><b>{money(data.income)}</b><span>Expenses</span><b>{money(data.expenses)}</b></div>
      </section>
      <div className="stats">
        <Stat label="Total income" value={money(data.income)} icon={<ArrowUpRight />} />
        <Stat label="Total expenses" value={money(data.expenses)} icon={<ReceiptText />} />
        <Stat label="Cash savings" value={money(data.savings)} icon={<Wallet />} />
        <Stat label="Investments / assets" value={money(data.assetValue)} icon={<TrendingUp />} />
      </div>
      <section className="card chart">
        <h3>Net worth over time</h3>
        <p>Your cumulative wealth from recorded activity</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={historyPoints}>
            <defs><linearGradient id="wealthFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#168165" stopOpacity=".28" /><stop offset="1" stopColor="#168165" stopOpacity="0" /></linearGradient></defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis width={80} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(value) => money(value)} />
            <Area type="monotone" dataKey="value" stroke="#116b55" strokeWidth={3} fill="url(#wealthFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>
      {monthlyNet.length > 0 && (
        <section className="card chart">
          <h3>Monthly cash flow</h3>
          <p>Income vs expenses per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyNet}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ede9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis width={80} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value) => money(value)} />
              <Line type="monotone" dataKey="income" stroke="#168165" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#e11d48" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
      <section className="card">
        <h3>Assets and investments</h3>
        <p>Track the current value of your investments and possessions.</p>
        {data.assets.length ? <div className="asset-list">{data.assets.map((asset) => <div className="row" key={asset.id}><span className="circle">↗</span><div><b>{asset.name}</b><small>{asset.type}</small></div><b className="positive">{money(asset.value)}</b><button className="icon-action danger" title="Delete asset" onClick={() => remove(asset.id)}><Trash2 /></button></div>)}</div> : <div className="empty"><p>No assets recorded yet.</p></div>}
      </section>
      <section className="card">
        <h3>Financial health snapshot</h3>
        <p>Based on your recorded income and expenses.</p>
        <div className="health"><b>{savingsRate}%</b><span>of your recorded income remains after expenses</span></div>
      </section>
      {modal && <Modal title="Add asset or investment" onClose={() => setModal(false)}><form className="form" onSubmit={save}><label>Asset name<input name="name" required placeholder="Index fund" value={form.name} onChange={update} /></label><label>Asset type<select name="type" value={form.type} onChange={update}><option>Investment</option><option>Cash</option><option>Property</option><option>Vehicle</option><option>Other</option></select></label><label className="full">Current value (₹)<input name="value" required type="number" min="1" value={form.value} onChange={update} /></label><button className="primary">Save asset</button></form></Modal>}
    </>
  );
}

export default WealthPage;