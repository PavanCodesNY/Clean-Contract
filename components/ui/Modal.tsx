"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-lg"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  New contract
                </p>
                <h2
                  className="mt-2 text-lg font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {children}
            </div>
            {footer ? (
              <div className="border-t border-border px-6 py-4">{footer}</div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
