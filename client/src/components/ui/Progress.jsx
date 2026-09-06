import { money } from '../../utils/format';

export function Progress({ goal }) {
  const percentage = Math.min(100, Math.round(Number(goal.currentAmount) / Number(goal.targetAmount) * 100));
  return <div className="progress"><div className="between"><b>{goal.icon} {goal.name}</b><strong>{percentage}%</strong></div><small>{money(goal.currentAmount)} of {money(goal.targetAmount)}</small><div className="track"><i style={{ width: `${percentage}%` }} /></div></div>;
}
