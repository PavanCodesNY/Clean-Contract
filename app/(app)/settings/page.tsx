"use client";

import { motion } from "framer-motion";
import { Globe, Shield, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
};

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Tune the workspace defaults and integrations."
      disableMotion
      actions={
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-foreground"
        >
          <Sparkles className="h-4 w-4" />
          Update settings
        </motion.button>
      }
    >
      <motion.section
        variants={item}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Default jurisdiction</p>
              <p className="text-xs text-muted-foreground">United States</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground"
          >
            Change default
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Risk tolerance</p>
              <p className="text-xs text-muted-foreground">
                Balanced clause protection
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground"
          >
            Adjust threshold
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Integrations
          </p>
          <div className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-4 text-sm text-muted-foreground">
            No integrations configured yet. Connect services once you are ready
            to store or share contracts.
          </div>
        </div>
      </motion.section>
    </AppShell>
  );
}
