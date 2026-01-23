export default function CharactersPage() {
  return (
    <div className="p-9">
      <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-heading)]">
        Characters
      </h1>
      <p className="text-text-muted mt-2">
        Manage your AI characters
      </p>
      {/* Character grid will be implemented in Phase 4 */}
      <div className="mt-8 p-8 rounded-[var(--radius-panel)] border border-border bg-bg-panel text-center text-text-muted">
        Character management coming soon...
      </div>
    </div>
  );
}
