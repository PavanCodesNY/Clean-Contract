export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Contract Generator AI
        </h1>
        <p className="text-xl text-muted-foreground">
          Professional contracts powered by AI research. Generate legally-sound
          service agreements, NDAs, and consulting contracts in minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/chat"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-lg bg-primary hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg"
          >
            Start Contract
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  );
}
