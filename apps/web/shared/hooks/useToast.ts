"use client";

import { toast } from "sonner";

const TOAST_STYLES = {
  success: {
    background: "#16161A",
    color: "#32D583",
    border: "1px solid #32D583",
    borderRadius: "12px",
  },
  error: {
    background: "#16161A",
    color: "#EF4444",
    border: "1px solid #EF4444",
    borderRadius: "12px",
  },
  default: {
    background: "#16161A",
    color: "#FAFAF9",
    border: "1px solid #2A2A2E",
    borderRadius: "12px",
  },
} as const;

export function useToast() {
  return {
    success: (message: string) => toast.success(message, { style: TOAST_STYLES.success }),
    error: (message: string) => toast.error(message, { style: TOAST_STYLES.error }),
    info: (message: string) => toast(message, { style: TOAST_STYLES.default }),
    loading: (message: string) => toast.loading(message, { style: TOAST_STYLES.default }),
    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  };
}

// Export standalone functions for use outside of React components
export const showToast = {
  success: (message: string) => toast.success(message, { style: TOAST_STYLES.success }),
  error: (message: string) => toast.error(message, { style: TOAST_STYLES.error }),
  info: (message: string) => toast(message, { style: TOAST_STYLES.default }),
};
