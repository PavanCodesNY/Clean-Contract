"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, MessageSquare, Plus, Sparkles, UploadCloud } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Modal } from "@/components/ui/Modal";

export default function DashboardPage() {
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
  const [updatedDemands, setUpdatedDemands] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<
    Record<string, { action: "pending" | "apply" | "ignore" | "ask" | "user"; note?: string; ask?: string; answer?: string }>
  >({});
  const [rewriteInFlight, setRewriteInFlight] = useState(false);
  const [contractTextExpanded, setContractTextExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const recommendationSections = useMemo(() => {
    if (!analysis.trim()) {
      return [];
    }
    const sections: { title: string; items: string[] }[] = [];
    const blocks = analysis.split(/\n##\s+/).map((block) => block.trim());
    for (const block of blocks) {
      if (!block) {
        continue;
      }
      const [rawTitle, ...rest] = block.split("\n");
      const title = rawTitle.replace(/^#+\s*/, "").trim();
      const items = rest
        .join("\n")
        .split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean);
      sections.push({ title, items });
    }
    if (sections.length === 0) {
      return [
        {
          title: "Recommendations",
          items: analysis
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
      ];
    }
    return sections;
  }, [analysis]);

  const recommendationItems = useMemo(() => {
    if (recommendationSections.length === 0) {
      return [];
    }
    return recommendationSections.flatMap((section) =>
      section.items.map((itemText) => ({
        id: `${section.title}-${itemText.slice(0, 24)}`,
        section: section.title,
        text: itemText,
      }))
    );
  }, [recommendationSections]);

  useEffect(() => {
    if (recommendationItems.length === 0) {
      setDecisions({});
      return;
    }
    const next: Record<string, { action: "pending" | "apply" | "ignore" | "ask" | "user"; note?: string }> = {};
    for (const item of recommendationItems) {
      next[item.id] = { action: "pending" };
    }
    setDecisions(next);
  }, [recommendationItems]);

  const refreshPreview = useCallback(
    async (textOverride?: string) => {
      const bodyText = textOverride ?? contractText;
      if (!bodyText.trim()) {
        return;
      }
      const formData = new FormData();
      formData.append("title", "Clauseflow Contract");
      formData.append("body", bodyText);
      formData.append("party_a", "Client");
      formData.append("party_b", "Provider");
      const response = await fetch("/api/preview", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const detail = await response.text();
        setError(detail || "Preview failed");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) {
          window.URL.revokeObjectURL(prev);
        }
        return url;
      });
    },
    [contractText]
  );

  const handleDecision = (id: string, action: "apply" | "ignore" | "ask" | "user") => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...prev[id], action },
    }));
  };

  const handleUserNote = (id: string, note: string) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...prev[id], action: "user", note },
    }));
  };

  const handleAsk = async (id: string, question: string) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...prev[id], action: "ask", ask: question },
    }));
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Ask AI failed");
      }
      const payload = (await response.json()) as { response: string };
      setDecisions((prev) => ({
        ...prev,
        [id]: { ...prev[id], action: "ask", ask: question, answer: payload.response },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask AI failed");
    }
  };

  const allDecided =
    recommendationItems.length > 0 &&
    recommendationItems.every((item) => decisions[item.id]?.action !== "pending");

  useEffect(() => {
    if (!allDecided || rewriteInFlight || recommendationItems.length === 0) {
      return;
    }
    const runRewrite = async () => {
      setRewriteInFlight(true);
      try {
        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_text: contractText,
            contract_type: contractType,
            jurisdiction,
            industry,
            recommendations: recommendationItems.map((item) => ({
              section: item.section,
              text: item.text,
              action: decisions[item.id]?.action ?? "ignore",
              user_note: decisions[item.id]?.note,
            })),
          }),
        });
        if (!response.ok) {
          const detail = await response.text();
          throw new Error(detail || "Rewrite failed");
        }
        const payload = (await response.json()) as { rewritten_text: string };
        setContractText(payload.rewritten_text);
        await refreshPreview(payload.rewritten_text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rewrite failed");
      } finally {
        setRewriteInFlight(false);
      }
    };
    runRewrite();
  }, [
    allDecided,
    rewriteInFlight,
    recommendationItems,
    decisions,
    contractText,
    contractType,
    jurisdiction,
    industry,
    refreshPreview,
  ]);

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
      setOpen(false);
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
      await refreshPreview(textToAnalyze);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "docx" | "pdf") => {
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
      title="Overview"
      description="Track research, drafts, and approvals in one calm view."
      hideHeader
    >
      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
        }}
        className="grid h-full flex-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
      >
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <div className="rounded-2xl border border-border bg-surface px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Workspace
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Overview
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track research, drafts, and approvals in one calm view.
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.1 }}
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                New contract
              </motion.button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Start
            </p>
            <h2
              className="mt-2 text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Upload or describe a contract
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a contract for instant review, or use the guided contract chat
              to draft from scratch.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Upload existing
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Analyze and improve any .pdf, .docx, or .txt contract.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs text-white"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload contract
                </button>
              </div>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Describe new
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Answer targeted questions to generate a clean first draft.
                </p>
                <a
                  href="/see-chat"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted-foreground"
                >
                  Start contract chat
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5">
            {/* Contract Source Expanded Mode - Takes over entire card */}
            {contractTextExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 flex-col gap-4"
              >
                {/* Expanded Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                        Contract Source
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {contractText
                          ? `${contractText.length.toLocaleString()} characters`
                          : "Paste or edit your contract text"}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setContractTextExpanded(false)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    <ChevronDown className="h-4 w-4 rotate-180" />
                    Collapse
                  </motion.button>
                </div>

                {/* Full-size textarea */}
                <div className="flex flex-1 flex-col rounded-xl border border-border bg-surface-2 p-4">
                  <textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    className="flex-1 resize-none rounded-lg border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="Paste your contract text here, or it will appear automatically after uploading a document..."
                  />
                </div>

                {/* Export Actions */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Export contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("pdf")}
                      disabled={formatting || !contractText}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
                    >
                      {formatting ? "..." : ".pdf"}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("docx")}
                      disabled={formatting || !contractText}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      {formatting ? "..." : ".docx"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Normal Mode - All sections visible */
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                        Analysis & Export
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {recommendationItems.length > 0
                          ? `${recommendationItems.length} suggestions found`
                          : "Upload a contract to begin"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] ${
                      analysis
                        ? "border border-primary/20 bg-primary/10 text-primary"
                        : "border border-border bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {analysis ? "Ready" : "Pending"}
                  </span>
                </div>

                {/* AI Recommendations Carousel */}
                {recommendationItems.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">AI Recommendations</p>
                      <div className="flex items-center gap-1">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    <div
                      ref={carouselRef}
                      className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none"
                    >
                      {recommendationItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="min-w-[260px] max-w-[280px] shrink-0 snap-start rounded-xl border border-border bg-surface p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                              {item.section}
                            </span>
                            <div className="flex gap-1">
                              {(["apply", "ignore", "ask"] as const).map((action) => (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => handleDecision(item.id, action)}
                                  className={`rounded-md px-2 py-0.5 text-[0.6rem] uppercase tracking-wider transition-all ${
                                    decisions[item.id]?.action === action
                                      ? action === "apply"
                                        ? "bg-primary text-white"
                                        : "bg-foreground/10 text-foreground"
                                      : "text-muted-foreground hover:bg-surface-2"
                                  }`}
                                >
                                  {action === "ask" ? "?" : action}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground">
                            {item.text}
                          </p>
                          {decisions[item.id]?.action === "ask" && (
                            <div className="mt-2 space-y-2">
                              <input
                                placeholder="Ask about this..."
                                className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAsk(item.id, (e.target as HTMLInputElement).value);
                                  }
                                }}
                              />
                              {decisions[item.id]?.answer && (
                                <p className="rounded-lg bg-primary/5 px-2.5 py-1.5 text-xs text-muted-foreground">
                                  {decisions[item.id]?.answer}
                                </p>
                              )}
                            </div>
                          )}
                          <input
                            placeholder="Add your note..."
                            className="mt-2 w-full rounded-lg border border-transparent bg-transparent px-0 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-border focus:bg-surface-2 focus:px-2"
                            value={decisions[item.id]?.note ?? ""}
                            onChange={(e) => handleUserNote(item.id, e.target.value)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for recommendations */}
                {recommendationItems.length === 0 && (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload a contract to generate AI recommendations.
                    </p>
                  </div>
                )}

                {/* Your Changes - Primary Input */}
                <div className="flex flex-1 flex-col rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <label className="text-xs font-medium text-foreground">
                      Your Changes & Requirements
                    </label>
                  </div>
                  <p className="mt-1 text-[0.65rem] text-muted-foreground">
                    Describe modifications, special clauses, or specific terms you want in the final contract.
                  </p>
                  <textarea
                    value={updatedDemands}
                    onChange={(e) => setUpdatedDemands(e.target.value)}
                    className="mt-3 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g., Add a 30-day termination clause, increase liability cap to $500k, include NDA provisions..."
                  />
                </div>

                {/* Contract Source Toggle */}
                <button
                  type="button"
                  onClick={() => setContractTextExpanded(true)}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-colors hover:bg-surface-2/80"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Contract Source</span>
                    {contractText && (
                      <span className="rounded-md bg-surface px-2 py-0.5 text-[0.6rem] text-muted-foreground">
                        {contractText.length.toLocaleString()} chars
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Click to expand</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

                {/* Export Actions */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Export contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("pdf")}
                      disabled={formatting || !contractText}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
                    >
                      {formatting ? "..." : ".pdf"}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("docx")}
                      disabled={formatting || !contractText}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      {formatting ? "..." : ".docx"}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-2">
          <div className="h-full rounded-xl border border-border/60 bg-surface-2">
            {previewUrl ? (
              <iframe
                title="Contract preview"
                src={previewUrl}
                className="h-full w-full rounded-xl"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Preview will appear after analysis.
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <Modal
        open={open}
        title="Upload a contract to analyze"
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
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
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
          <label className="group flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              {file ? file.name : "Upload contract (.pdf, .docx, .txt)"}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em]">
              Browse
            </span>
            <input
              type="file"
              accept=".docx,.txt,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          {error ? (
            <p className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs text-white disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "Uploading..." : "Upload + analyze"}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
