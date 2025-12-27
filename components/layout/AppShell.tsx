"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Chat", href: "/see-chat", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.01 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] },
  },
};

type AppShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  hideHeader?: boolean;
  mainPadding?: boolean;
  mainClassName?: string;
  disableMotion?: boolean;
};

export default function AppShell({
  title,
  description,
  actions,
  children,
  hideHeader = false,
  mainPadding = true,
  mainClassName,
  disableMotion = true,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cf-sidebar-collapsed");
    if (stored === "1") {
      setCollapsed(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cf-sidebar-collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed, mounted]);

  const isCollapsed = mounted ? collapsed : false;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 right-[-8rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.82_0.05_220)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.78_0.06_150)_0%,transparent_70%)] blur-3xl"
      />

      <motion.div
        initial={disableMotion ? false : "hidden"}
        animate={disableMotion ? false : "show"}
        variants={disableMotion ? undefined : container}
        suppressHydrationWarning
        style={{
          ["--sidebar-width" as string]: isCollapsed ? "80px" : "256px",
        }}
        className="relative flex h-full w-full flex-col overflow-hidden lg:grid lg:grid-cols-[var(--sidebar-width)_1fr] lg:grid-rows-[1fr]"
      >
        <motion.header
          variants={disableMotion ? undefined : item}
          className="flex flex-col gap-4 border-b border-border bg-surface px-4 py-4 lg:hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-xs font-semibold text-muted-foreground">
                CF
              </div>
              <span className="text-sm font-medium text-foreground">
                Clauseflow
              </span>
            </div>
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}

          <nav className="flex items-center gap-1">
            {navItems.map((navItem) => {
              const isActive = pathname === navItem.href;
              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <navItem.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </motion.header>

        <motion.aside
          variants={disableMotion ? undefined : item}
          className="hidden h-full flex-col border-r border-border bg-surface lg:flex"
        >
          <div className="flex items-center p-4">
            <div
              className={`flex w-full items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-xs font-semibold text-muted-foreground">
                  CF
                </div>
                {!isCollapsed ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Clauseflow
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Workspace
                    </p>
                  </div>
                ) : null}
              </div>
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}

          <nav
            className={`mt-2 flex flex-col gap-1 px-3 ${
              isCollapsed ? "items-center" : ""
            }`}
          >
            {navItems.map((navItem) => {
              const isActive = pathname === navItem.href;
              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:bg-surface-2/50"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border ${
                      isActive ? "bg-primary/10 text-primary" : "bg-surface-2"
                    }`}
                  >
                    <navItem.icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed ? (
                    <span className="text-sm">{navItem.label}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4">
            {!isCollapsed ? (
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-foreground">
                    All systems operational
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </motion.aside>

        <motion.main
          variants={disableMotion ? undefined : item}
          className={`flex h-full min-h-0 flex-1 flex-col gap-6 ${
            mainPadding ? "px-4 py-6 lg:px-8 lg:py-8" : ""
          } ${mainClassName ?? ""}`}
        >
          {!hideHeader ? (
            <motion.header
              variants={item}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Workspace
                </p>
                <h1
                  className="mt-2 text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
              ) : null}
            </motion.header>
          ) : null}

          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
