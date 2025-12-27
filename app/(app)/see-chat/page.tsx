"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ChevronRight,
  Clock,
  FileText,
  Paperclip,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatHistoryItem = {
  id: string;
  title: string;
  messages: StoredMessage[];
  updatedAt: string;
};

type ResearchResults = Record<
  string,
  { results?: Array<{ title?: string; url?: string }> }
>;

const quickPrompts = [
  { label: "Review clause", icon: FileText },
  { label: "Add termination", icon: Plus },
  { label: "Explain risk", icon: Zap },
];

const buildResearchSummary = (results: ResearchResults) => {
  const lines: string[] = ["Research summary:"];
  Object.entries(results).forEach(([area, payload]) => {
    const topResult = payload?.results?.[0];
    if (topResult?.title) {
      const suffix = topResult.url ? ` (${topResult.url})` : "";
      lines.push(`- ${area}: ${topResult.title}${suffix}`);
      return;
    }
    lines.push(`- ${area}: No result yet`);
  });
  return lines.join("\n");
};

export default function SeeChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState("");
  const [contractType, setContractType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [industry, setIndustry] = useState("");
  const [researchLoading, setResearchLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cf-chat-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatHistoryItem[];
        setChatHistory(parsed);
      } catch {
        setChatHistory([]);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("cf-chat-history", JSON.stringify(chatHistory));
  }, [chatHistory, mounted]);

  const serializeMessages = (items: Message[]): StoredMessage[] =>
    items.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString(),
    }));

  const deserializeMessages = (items: StoredMessage[]): Message[] =>
    items.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));

  const buildContextPrompt = (content: string) => {
    const history = messages
      .slice(-10)
      .map((message) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${
          message.content
        }`
      )
      .join("\n");
    if (!history) {
      return content;
    }
    return `Conversation so far:\n${history}\n\nUser: ${content}`;
  };

  const getChatTitle = () => {
    const title = contractTitle.trim();
    if (title) return title;
    const firstUser = messages.find((message) => message.role === "user");
    if (!firstUser) return "Untitled chat";
    return firstUser.content.slice(0, 48);
  };

  const stashCurrentChat = () => {
    if (messages.length === 0) {
      return;
    }
    const entry: ChatHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: getChatTitle(),
      messages: serializeMessages(messages),
      updatedAt: new Date().toISOString(),
    };
    setChatHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const prompt = buildContextPrompt(trimmed);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          conversation_id: conversationId ?? undefined,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Chat request failed");
      }

      const payload = (await response.json()) as {
        response: string;
        conversation_id: string;
      };

      setConversationId(payload.conversation_id);
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: payload.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = () => {
    stashCurrentChat();
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInput("");
    setContractTitle("");
    setContractType("");
    setJurisdiction("");
    setIndustry("");
  };

  const handleResearch = async () => {
    if (!contractType.trim()) {
      setError("Add a contract type to run research.");
      return;
    }
    setResearchLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_type: contractType.trim(),
          jurisdiction: jurisdiction.trim() || undefined,
          industry: industry.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Research request failed");
      }

      const payload = (await response.json()) as {
        results: ResearchResults;
      };

      const summary = buildResearchSummary(payload.results);
      const assistantMessage: Message = {
        id: `${Date.now()}-research`,
        role: "assistant",
        content: summary,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research request failed");
    } finally {
      setResearchLoading(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {contractTitle.trim() || "Untitled contract chat"}
            </h1>
            <p className="text-xs text-muted-foreground">AI drafting session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-success sm:inline-flex">
            Research ready
          </span>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
            aria-label="Open chat history"
          >
            <Clock className="h-4 w-4" />
            {chatHistory.length > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {Math.min(chatHistory.length, 9)}
              </span>
            ) : null}
          </button>
          <Link
            href="/dashboard"
            className="hidden rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex"
          >
            Back to overview
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">New</span>
          </motion.button>
        </div>
      </header>

      <div className="border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            placeholder="Contract type (required for research)"
            className="h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            placeholder="Jurisdiction"
            className="h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry"
            className="h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.1 }}
            onClick={handleResearch}
            disabled={researchLoading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground disabled:opacity-60"
          >
            {researchLoading ? "Researching..." : "Run research"}
          </motion.button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={contractTitle}
            onChange={(e) => setContractTitle(e.target.value)}
            placeholder="Contract title"
            className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col justify-end px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2
                    className="text-xl font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Start drafting
                  </h2>
                  <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
                    Describe your contract needs and I&apos;ll help you create
                    precise, legally-sound documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          message.role === "user"
                            ? "bg-primary/15 text-primary"
                            : "bg-gradient-to-br from-primary/15 to-accent/15"
                        }`}
                      >
                        {message.role === "user" ? (
                          <span className="text-sm font-semibold">U</span>
                        ) : (
                          <Sparkles className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 min-h-10 min-w-[40px] inline-flex items-center ${
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "border border-border bg-surface-2"
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {message.content.split("\n").map((line, i) => {
                            if (!line.trim()) return null;
                            return (
                              <p key={i} className={i > 0 ? "mt-3" : ""}>
                                {line.startsWith("**") ? (
                                  <strong className="font-semibold">
                                    {line.replace(/\*\*/g, "")}
                                  </strong>
                                ) : line.startsWith("- ") ? (
                                  <span className="flex items-start gap-2">
                                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-50" />
                                    <span>{line.slice(2)}</span>
                                  </span>
                                ) : (
                                  line
                                )}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping ? (
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface-2 px-4 py-3">
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.span
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay,
                              }}
                              className="h-2 w-2 rounded-full bg-primary/60"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3">
        {error ? (
          <div className="mx-auto mb-3 max-w-3xl rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
            {error}
          </div>
        ) : null}
        <div className="mx-auto mb-3 flex max-w-3xl flex-wrap justify-center gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => sendMessage(prompt.label)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              <prompt.icon className="h-3 w-3" />
              {prompt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-2 p-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you need to draft..."
              rows={1}
              className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-30"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>

        <p className="mx-auto mt-3 max-w-3xl text-center text-[10px] text-muted-foreground">
          Clauseflow may make mistakes. Always review generated content.
        </p>
      </div>

      <AnimatePresence>
        {historyOpen ? (
          <motion.div
            className="fixed inset-0 z-40 flex items-start justify-end bg-black/20 p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setHistoryOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.1 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Chat history
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Recent sessions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
                {chatHistory.length === 0 ? (
                  <div className="rounded-xl border border-border bg-surface-2 px-4 py-4 text-xs text-muted-foreground">
                    No saved chats yet. Start a conversation and hit New to
                    archive it here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((entry) => {
                      const count = entry.messages.length;
                      const updated = new Date(entry.updatedAt);
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setMessages(deserializeMessages(entry.messages));
                            setContractTitle(entry.title);
                            setConversationId(null);
                            setHistoryOpen(false);
                          }}
                          className="flex w-full flex-col gap-1 rounded-xl border border-border bg-surface-2 px-3 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/30"
                        >
                          <span className="font-medium">{entry.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {count} messages · {updated.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
