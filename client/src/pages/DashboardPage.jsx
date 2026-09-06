import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { PageTitle } from "../components/ui/PageTitle";
import { Progress } from "../components/ui/Progress";
import { Stat } from "../components/ui/Stat";
import { money, formatMonth } from "../utils/format";

const emptyDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

export function DashboardPage({ data, onNavigate }) {
  const points = (data.wealthHistory?.length || 0) > 1
    ? data.wealthHistory.map((point) => ({ month: formatMonth(point.date), value: point.value }))
    : [{ month: new Date().toLocaleString("en", { month: "short" }), value: data.netWorth }];
  return (
    <>
      <PageTitle
        title={`Good ${emptyDay}!`}
        sub="Here's how your financial journey is progressing."
      />
      <div className="stats">
        <Stat
          label="Net worth"
          value={money(data.netWorth)}
          icon={<Wallet />}
        />
        <Stat
          label="This month’s income"
          value={money(data.income)}
          icon={<ArrowUpRight />}
        />
        <Stat
          label="Expenses"
          value={money(data.expenses)}
          icon={<ReceiptText />}
        />
        <Stat
          label="Available savings"
          value={money(data.savings)}
          icon={<TrendingUp />}
        />
      </div>
      <div className="grid two">
        <section className="card chart">
          <h3>Wealth growth</h3>
          <p>Your net worth over time</p>
          <strong>{money(data.netWorth)}</strong>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={points}>
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#168165" stopOpacity=".28" />
                  <stop offset="1" stopColor="#168165" stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => money(value)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#116b55"
                strokeWidth={3}
                fill="url(#fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="card">
          <div className="between">
            <div>
              <h3>Savings goals</h3>
              <p>Keep your eyes on the prize</p>
            </div>
            <button className="link" onClick={() => onNavigate("goals")}>
              View all
            </button>
          </div>
          {data.goals.length ? (
            data.goals
              .slice(0, 3)
              .map((goal) => <Progress key={goal.id} goal={goal} />)
          ) : (
            <EmptyState
              text="Set your first savings goal"
              action={() => onNavigate("goals")}
            />
          )}
        </section>
      </div>
      <div className="grid two">
        <section className="card">
          <div className="between">
            <h3>Recent activity</h3>
            <button className="link" onClick={() => onNavigate("transactions")}>
              View all
            </button>
          </div>
          {data.recentTransactions.length ? (
            data.recentTransactions.map((transaction) => (
              <div className="row" key={transaction.id}>
                <span className="circle">
                  {transaction.type === "INCOME" ? "↓" : "↑"}
                </span>
                <div>
                  <b>{transaction.category}</b>
                  <small>
                    {transaction.note ||
                      new Date(transaction.date).toLocaleDateString()}
                  </small>
                </div>
                <b
                  className={
                    transaction.type === "INCOME" ? "positive" : "negative"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {money(transaction.amount)}
                </b>
              </div>
            ))
          ) : (
            <EmptyState text="Your transactions will appear here." />
          )}
        </section>
        <section className="card insight">
          <small>WEEKLY INSIGHT</small>
          <h3>You’re building momentum.</h3>
          <p>
            Every expense you record and habit you complete puts you closer to
            financial clarity.
          </p>
          <button className="link" onClick={() => onNavigate("habits")}>
            View habits →
          </button>
        </section>
      </div>
    </>
  );
}

export default DashboardPage;
