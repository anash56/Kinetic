import { useEffect, useState } from "react";
import { MessageSquareWarning, ReceiptText, Repeat2, Shield, Target, TrendingUp, Users } from "lucide-react";
import { PageTitle } from "../components/ui/PageTitle";
import { Stat } from "../components/ui/Stat";
import { api } from "../lib/api";
import { money } from "../utils/format";

export function AdminPage() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api("/admin/overview").then(setData).catch(() => {});
    api("/admin/users").then(setUsers).catch(() => {});
    api("/admin/analytics").then(setAnalytics).catch(() => {});
    api("/admin/feedback").then(setFeedback).catch(() => {});
  }, []);

  const setFeedbackStatus = async (id, status) => {
    await api(`/admin/feedback/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    const next = await api("/admin/feedback");
    setFeedback(next);
  };

  const totalPortfolio = analytics ? Number(analytics.netPlatformWorth) : 0;

  return (
    <>
      <PageTitle title="Admin panel" sub="Platform activity and user overview." />
      {data ? (
        <div className="stats">
          <Stat label="Registered users" value={data.users} icon={<Shield />} />
          <Stat label="Transactions logged" value={data.transactions} icon={<ReceiptText />} />
          <Stat label="Active habits" value={data.habits} icon={<Repeat2 />} />
          <Stat label="Savings goals" value={data.goals} icon={<Target />} />
          <Stat label="Open feedback" value={feedback.filter((f) => f.status === "OPEN").length} icon={<MessageSquareWarning />} />
        </div>
      ) : (
        <p>Loading analytics…</p>
      )}

      {analytics && (
        <section className="card under-stats">
          <div>
            <small>PLATFORM-WIDE NET WORTH</small>
            <h2>{money(totalPortfolio)}</h2>
            <p>Total income minus expenses plus tracked assets across all users</p>
          </div>
          <div className="pills">
            <span><Users /> {analytics.activeUsers} active users</span>
            <span><Repeat2 /> {analytics.habitCompletionRate}% habit completion</span>
          </div>
        </section>
      )}

      {analytics?.topCategories?.length > 0 && (
        <section className="card">
          <h3>Top spending categories</h3>
          <div className="topcats">
            {analytics.topCategories.map((cat, i) => (
              <div className="pill" key={cat.category}>
                <span>{i + 1}. {cat.category}</span>
                <b>{money(cat.amount)}</b>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card table">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Transactions</th>
              <th>Habits</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><b>{user.name}</b></td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user._count.transactions}</td>
                <td>{user._count.habits}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card table">
        <div className="between">
          <div>
            <h3>User feedback</h3>
            <p>Requests and complaints from users.</p>
          </div>
        </div>
        {feedback.length ? (
          <div className="feedback-list">
            {feedback.map((fb) => (
              <div className="row" key={fb.id}>
                <span className="circle">{fb.user?.name?.slice(0, 1) || "?"}</span>
                <div>
                  <b>{fb.user?.name || "Unknown"} <small className="muted">{new Date(fb.createdAt).toLocaleDateString()}</small></b>
                  <small>{fb.message}</small>
                </div>
                <select
                  className={`tag status-${fb.status.toLowerCase()}`}
                  value={fb.status}
                  onChange={(e) => setFeedbackStatus(fb.id, e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="IGNORED">IGNORED</option>
                </select>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No feedback yet.</p>
        )}
      </section>
    </>
  );
}