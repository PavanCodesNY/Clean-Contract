"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Settings,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Chat", href: "/see-chat", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarFrameProps = {
  children: ReactNode;
};

export default function SidebarFrame({ children }: SidebarFrameProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cf-sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cf-sidebar-collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed, mounted]);

  const isCollapsed = mounted ? collapsed : false;

  return (
    <div className="fixed inset-0 flex bg-background text-foreground">
      <aside
        className={`hidden h-full flex-col border-r border-border bg-surface lg:flex ${
          isCollapsed ? "w-20" : "w-64"
        }`}
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
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
