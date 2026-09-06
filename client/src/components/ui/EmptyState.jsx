export function EmptyState({ text, action }) {
  return (
    <div className="empty">
      <p>{text}</p>
      {action && (
        <button className="link" onClick={action}>
          Get started →
        </button>
      )}
    </div>
  );
}
