export const dateKey = (date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const periodKey = (frequency, date = new Date()) => {
  const value = new Date(date);
  if (frequency === 'DAILY') return dateKey(value);
  if (frequency === 'MONTHLY') return `${value.getFullYear()}-${value.getMonth()}`;
  const monday = new Date(value);
  const daysFromMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysFromMonday);
  return dateKey(monday);
};

export const isCompletedThisPeriod = (habit, date = new Date()) => {
  const currentPeriod = periodKey(habit.frequency, date);
  return habit.completions.some((completion) => periodKey(habit.frequency, completion.completedOn) === currentPeriod);
};

export const periodLabel = (frequency) => ({
  DAILY: 'today',
  WEEKLY: 'this week',
  MONTHLY: 'this month',
}[frequency] || 'this period');
