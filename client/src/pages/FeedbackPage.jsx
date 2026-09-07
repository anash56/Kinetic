import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageTitle } from '../components/ui/PageTitle';
import { api } from '../lib/api';

export function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api('/feedback', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      setMessage('');
      setStatus('Thanks for sharing your feedback.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title="Feedback" sub="Help us improve your financial workspace." />
      <section className="card feedback-form-card">
        <div className="feedback-heading">
          <span className="feedback-icon"><MessageSquare /></span>
          <div>
            <h3>Share your thoughts</h3>
            <p>Tell us what is working well or what would make Kinetic better.</p>
          </div>
        </div>
        <form className="form" onSubmit={submit}>
          <label className="full">
            Your feedback
            <textarea
              required
              minLength="3"
              maxLength="500"
              rows="6"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What would you like to see improved?"
            />
          </label>
          {status && <div className="notice full">{status}</div>}
          <button className="primary" disabled={saving}>
            {saving ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      </section>
    </>
  );
}

export default FeedbackPage;
