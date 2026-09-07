import { AlertTriangle, Check } from 'lucide-react';

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', busy = false, onConfirm, onCancel }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <section className="modal confirm">
        <span className={`confirmIcon ${variant}`}>
          {variant === 'danger' ? <AlertTriangle /> : <Check />}
        </span>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirmActions">
          <button className="ghost" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={`primary ${variant}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}