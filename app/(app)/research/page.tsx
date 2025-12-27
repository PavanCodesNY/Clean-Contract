"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookCheck, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const mandatoryAreas = [
  "Contract standards",
  "Industry norms",
  "Jurisdiction requirements",
  "Deal benchmarks",
  "Common disputes",
  "Recent developments",
  "Power dynamics",
  "Termination scenarios",
  "Enforceability",
  "Alternative structures",
];

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
};

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

type ResearchResponse = {
  results: Record<string, { results?: TavilyResult[] }>;
  completed_areas: string[];
};

export default function ResearchPage() {
  const [contractType, setContractType] = useState("Service agreement");
  const [jurisdiction, setJurisdiction] = useState("California");
  const [industry, setIndustry] = useState("SaaS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResearchResponse | null>(null);

  const coverage = useMemo(() => {
    if (!data) {
      return 0;
    }
    return Math.round((data.completed_areas.length / mandatoryAreas.length) * 100);
  }, [data]);

  const handleRunResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_type: contractType,
          jurisdiction: jurisdiction || undefined,
          industry: industry || undefined,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Research request failed");
      }

      const payload = (await response.json()) as ResearchResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Research"
      description="Mandatory research checks across every engagement."
      actions={
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.1 }}
          onClick={handleRunResearch}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Running..." : "Run research"}
        </motion.button>
      }
    >
      <motion.section
        variants={item}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"
      >
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Research coverage
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                10 required research areas
              </h2>
            </div>
            <BookCheck className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">
              Contract type
              <input
                value={contractType}
                onChange={(event) => setContractType(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Jurisdiction
              <input
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Industry
              <input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            {mandatoryAreas.map((area) => {
              const areaResults = data?.results?.[area]?.results ?? [];
              return (
                <motion.div key={area} variants={item} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{area}</span>
                    <span className="text-xs text-muted-foreground">
                      {areaResults.length} results
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: data ? "100%" : "0%" }}
                      transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-2 rounded-full bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    {areaResults.slice(0, 2).map((result, index) => (
                      <div
                        key={`${area}-${index}`}
                        className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground"
                      >
                        <p className="text-sm text-foreground">
                          {result.title ?? "Untitled result"}
                        </p>
                        {result.url ? (
                          <p className="mt-1 truncate">{result.url}</p>
                        ) : null}
                      </div>
                    ))}
                    {data && areaResults.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No results returned.
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {data ? `${coverage}%` : "—"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data
                ? `${data.completed_areas.length} areas complete`
                : "Run research to populate insights."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Latest insight
            </p>
            <p className="mt-3 text-sm text-foreground">
              {data
                ? "Scan the results list to summarize the most relevant findings."
                : "Insights will appear after a run."}
            </p>
            <button
              type="button"
              className="mt-4 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground"
            >
              Review summary
            </button>
          </div>
        </div>
      </motion.section>
    </AppShell>
  );
}
