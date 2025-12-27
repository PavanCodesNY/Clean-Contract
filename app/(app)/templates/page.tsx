"use client";

import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
};

export default function TemplatesPage() {
  return (
    <AppShell
      title="Templates"
      description="Curated structures built from your best contracts."
      actions={
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          New template
        </motion.button>
      }
    >
      <motion.section
        variants={item}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Template library
            </p>
            <h2
              className="mt-2 text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Build reusable contract blueprints
            </h2>
          </div>
          <Layers className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-6 rounded-xl border border-border bg-surface-2 p-5 text-sm text-muted-foreground">
          No templates yet. Save a contract as a template to reuse it here.
        </div>
      </motion.section>
    </AppShell>
  );
}
