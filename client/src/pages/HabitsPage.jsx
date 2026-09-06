import { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageTitle } from '../components/ui/PageTitle';
import { api } from '../lib/api';

export function HabitsPage({ habits, reload }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', frequency: 'DAILY', reminderTime: '' });

  const save = async (event) => {
    event.preventDefault();
    await api('/habits', { method: 'POST', body: JSON.stringify(form) });
    setModal(false);
    reload();
  };
  const complete = async (id) => {
    await api(`/habits/${id}/complete`, { method: 'POST' });
    reload();
  };
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageTitle
        title="Financial habits"
        sub="Small consistent actions build lasting wealth."
        action={<button className="primary small" onClick={() => setModal(true)}><Plus /> New habit</button>}
      />
      <div className="habitgrid">
        {habits.map((habit) => {
          const done = habit.completions.some((completion) => completion.completedOn.slice(0, 10) === today);
          const weekCount = habit.completions.filter((completion) => {
            const daysAgo = (Date.now() - new Date(completion.completedOn).getTime()) / 86400000;
            return daysAgo < 7;
          }).length;
          return (
            <section className="card habit" key={habit.id}>
              <span className="habitIcon">{habit.name.toLowerCase().includes('save') ? '💰' : '✓'}</span>
              <h3>{habit.name}</h3>
              <p className="muted">{habit.frequency.toLowerCase()}{habit.reminderTime && <span className="reminder"><Bell size={13} /> {habit.reminderTime}</span>}</p>
              <strong>{habit.completions.length} <small>check-ins</small></strong>
              <small className="muted">{weekCount} in the last 7 days</small>
              <button className={done ? 'done' : 'primary'} onClick={() => !done && complete(habit.id)}>
                {done ? 'Completed today ✓' : 'Mark complete'}
              </button>
            </section>
          );
        })}
      </div>
      {!habits.length && (
        <section className="card">
          <EmptyState text="Create a habit such as “Record today's expenses” or “Save ₹100 daily.”" action={() => setModal(true)} />
        </section>
      )}
      {modal && (
        <Modal title="Create financial habit" onClose={() => setModal(false)}>
          <form className="form" onSubmit={save}>
            <label className="full">Habit name<input name="name" required placeholder="Save ₹100 daily" value={form.name} onChange={update} /></label>
            <label>Frequency<select name="frequency" value={form.frequency} onChange={update}><option>DAILY</option><option>WEEKLY</option><option>MONTHLY</option></select></label>
            <label>Daily reminder<small className="muted">We'll remind you at this time</small><input name="reminderTime" type="time" value={form.reminderTime} onChange={update} /></label>
            <button className="primary">Create habit</button>
          </form>
        </Modal>
      )}
    </>
  );
}

export default HabitsPage;