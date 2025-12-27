export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-border bg-surface p-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Clauseflow
        </p>
        <h1
          className="text-3xl font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Landing page in progress
        </h1>
        <p className="text-sm text-muted-foreground">
          The dashboard experience is ready while we finalize the public
          marketing site.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
        >
          Open dashboard
        </a>
      </div>
    </main>
  );
}
