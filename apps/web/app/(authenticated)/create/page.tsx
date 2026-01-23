export default function CreatePage() {
  return (
    <div className="p-9">
      <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-heading)]">
        Create Image
      </h1>
      <p className="text-text-muted mt-2">
        Generate stunning images with AI
      </p>
      {/* Editor UI will be implemented in Phase 3 */}
      <div className="mt-8 p-8 rounded-[var(--radius-panel)] border border-border bg-bg-panel text-center text-text-muted">
        Image editor coming soon...
      </div>
    </div>
  );
}
