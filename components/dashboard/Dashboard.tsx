"use client";

import {
  BookCheck,
  FileText,
  Layers,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Dashboard() {
  return (
    <>
      <motion.div
        variants={item}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Quick search
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Find drafts, clauses, or clients instantly.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-muted-foreground sm:w-auto">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search workspace"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:w-44"
            />
          </div>
        </div>
      </motion.div>

      <motion.section
        variants={item}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Active drafts", icon: FileText },
          { label: "Research queue", icon: BookCheck },
          { label: "Review ready", icon: ShieldCheck },
          { label: "Avg. turn time", icon: TrendingUp },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.1 }}
            style={{ willChange: "transform, opacity" }}
            className="rounded-2xl border border-border bg-surface px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p
              className="mt-4 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              —
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting live data
            </p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Active drafts
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Drafts needing attention
              </h2>
            </div>
            <button
              type="button"
              className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              View all
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              No drafts yet. Create or upload a contract to see it here.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Research pipeline
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Mandatory research checks
              </h2>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              Run research to populate mandatory checks.
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-4 lg:grid-cols-[1fr_1fr]"
      >
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Templates
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                High-performing structures
              </h2>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              No templates yet. Save a contract as a template to reuse it.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Activity
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Latest movements
              </h2>
            </div>
            <div className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
              Live
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              No activity yet. Actions will appear here as you work.
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}
