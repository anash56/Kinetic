import { useEffect, useState } from "react";
import { LoaderCircle, MessageSquareWarning, ReceiptText, RefreshCw, Repeat2, Shield, ShieldCheck, Target, Trash2, Users } from "lucide-react";
import { PageTitle } from "../components/ui/PageTitle";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Stat } from "../components/ui/Stat";
import { api } from "../lib/api";
import { money } from "../utils/format";

export function AdminPage({ user }) {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [deleteUser, setDeleteUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");

  const loadUsers = () => api("/admin/users").then(setUsers).catch(() => {});
  const showNotice = (message) => { setNotice(message); setTimeout(() => setNotice(""), 3500); };
  const refreshAdminData = async () => {
    setRefreshing(true);
    try {
      const [overview, userList, platformAnalytics, feedbackList] = await Promise.all([
        api("/admin/overview"),
        api("/admin/users"),
        api("/admin/analytics"),
        api("/admin/feedback"),
      ]);
      setData(overview);
      setUsers(userList);
      setAnalytics(platformAnalytics);
      setFeedback(feedbackList);
    } catch (requestError) {
      showNotice(requestError.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAdminData();
    window.addEventListener("focus", refreshAdminData);
    return () => window.removeEventListener("focus", refreshAdminData);
  }, []);

  const setFeedbackStatus = async (id, status) => {
    await api(`/admin/feedback/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    const next = await api("/admin/feedback");
    setFeedback(next);
  };

  const toggleRole = async (user) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setBusy(true);
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role: nextRole }) });
      await loadUsers();
      showNotice(`${user.name} is now ${nextRole === "ADMIN" ? "an admin" : "a regular user"}.`);
    } catch (requestError) {
      showNotice(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteUser = async () => {
    setBusy(true);
    try {
      await api(`/admin/users/${deleteUser.id}`, { method: "DELETE" });
      await loadUsers();
      setDeleteUser(null);
      showNotice(`${deleteUser.name} was removed.`);
    } catch (requestError) {
      showNotice(requestError.message);
      setDeleteUser(null);
    } finally {
      setBusy(false);
    }
  };

  const totalPortfolio = analytics ? Number(analytics.netPlatformWorth) : 0;
  const me = user?.id;

  return (
    <>
      <PageTitle
        title="Admin panel"
        sub="Platform activity and user overview."
        action={<button className="icon-action" title="Refresh admin data" onClick={refreshAdminData} disabled={refreshing}>
          {refreshing ? <LoaderCircle className="spin" /> : <RefreshCw />}
        </button>}
      />
      {notice && <div className="notice">{notice}</div>}
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
        <div className="between">
          <div>
            <h3>Users</h3>
            <p>Promote users to admins or remove accounts.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Transactions</th>
              <th>Habits</th>
              <th>Joined</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === me;
              return (
                <tr key={user.id}>
                  <td><b>{user.name}{isSelf && <small className="muted"> · you</small>}</b></td>
                  <td>{user.email}</td>
                  <td><span className={`tag ${user.role === "ADMIN" ? "tag-admin" : "tag-user"}`}>{user.role}</span></td>
                  <td>{user._count.transactions}</td>
                  <td>{user._count.habits}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-action" title={user.role === "ADMIN" ? "Revoke admin" : "Make admin"} disabled={isSelf || busy} onClick={() => toggleRole(user)}>
                        {user.role === "ADMIN" ? <Shield /> : <ShieldCheck />}
                      </button>
                      <button className="icon-action danger" title="Delete user" disabled={isSelf || busy} onClick={() => setDeleteUser(user)}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
      {deleteUser && (
        <ConfirmDialog
          title="Delete user"
          message={`Remove “${deleteUser.name}” (${deleteUser.email})? This permanently deletes their account and all related financial data.`}
          confirmLabel="Delete user"
          busy={busy}
          onConfirm={confirmDeleteUser}
          onCancel={() => setDeleteUser(null)}
        />
      )}
    </>
  );
}

export default AdminPage;