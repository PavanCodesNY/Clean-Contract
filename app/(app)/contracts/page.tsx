"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FilePlus, FileText, ShieldCheck, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Modal } from "@/components/ui/Modal";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
};

export default function ContractsPage() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractType, setContractType] = useState("Service agreement");
  const [jurisdiction, setJurisdiction] = useState("California");
  const [industry, setIndustry] = useState("SaaS");

  const handleUpload = async () => {
    if (!file) {
      setError("Select a contract file to upload.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Upload failed");
      }
      const payload = (await response.json()) as { text: string };
      setContractText(payload.text);
      await handleAnalyze(payload.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (textOverride?: string) => {
    const textToAnalyze = textOverride ?? contractText;
    if (!textToAnalyze.trim()) {
      setError("Upload or paste contract text before analysis.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_text: textToAnalyze,
          contract_type: contractType,
          jurisdiction,
          industry,
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Analysis failed");
      }
      const payload = (await response.json()) as { recommendations: string };
      setAnalysis(payload.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormat = async (format: "docx" | "pdf") => {
    if (!contractText.trim()) {
      setError("Provide contract text before exporting.");
      return;
    }
    setError(null);
    setFormatting(true);
    try {
      const formData = new FormData();
      formData.append("title", "Clauseflow Contract");
      formData.append("body", contractText);
      formData.append("party_a", "Client");
      formData.append("party_b", "Provider");
      formData.append("output_format", format);
      const response = await fetch("/api/format", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Export failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        format === "pdf" ? "Clauseflow-Contract.pdf" : "Clauseflow-Contract.docx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setFormatting(false);
    }
  };

  return (
    <AppShell
      title="Contracts"
      description="Drafts, approvals, and signed agreements in one place."
      actions={
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.1 }}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <FilePlus className="h-4 w-4" />
          New contract
        </motion.button>
      }
    >
      <motion.section
        variants={item}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Upload & analyze
              </p>
              <h2
                className="mt-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Improve an existing contract
              </h2>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".docx,.txt,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="text-xs text-muted-foreground"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload contract"}
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs text-white disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {loading ? "Analyzing..." : "Run analysis"}
            </button>
            <button
              type="button"
              onClick={() => handleFormat("docx")}
              disabled={formatting}
              className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted-foreground disabled:opacity-60"
            >
              {formatting ? "Exporting..." : "Export formatted .docx"}
            </button>
            <button
              type="button"
              onClick={() => handleFormat("pdf")}
              disabled={formatting}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground disabled:opacity-60"
            >
              {formatting ? "Exporting..." : "Export formatted .pdf"}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
              {error}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Contract text
              </p>
              <textarea
                value={contractText}
                onChange={(event) => setContractText(event.target.value)}
                rows={12}
                className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground"
              />
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Recommendations
              </p>
              <div className="mt-3 h-[288px] overflow-y-auto rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
                {analysis || "Run analysis to generate recommendations."}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Compliance
            </p>
            <div className="mt-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">All signatures tracked</p>
                <p className="text-xs text-muted-foreground">
                  Export includes signature blocks.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground"
            >
              View signing queue
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Contract health
            </p>
            <p className="mt-3 text-3xl font-semibold">92%</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Most contracts follow research guidance.
            </p>
          </div>
        </div>
      </motion.section>
      <Modal
        open={open}
        title="Start a new contract"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary px-4 py-2 text-xs text-white"
            >
              Continue
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Contract type
            <input
              placeholder="Service agreement"
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Jurisdiction
            <input
              placeholder="California"
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Industry
            <input
              placeholder="SaaS, agency, consulting..."
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
      </Modal>
    </AppShell>
  );
}
