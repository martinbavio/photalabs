"use client";

import { toast } from "sonner";

export function useToast() {
  return {
    success: (message: string) => {
      toast.success(message, {
        style: {
          background: "#16161A",
          color: "#32D583",
          border: "1px solid #32D583",
          borderRadius: "12px",
        },
      });
    },
    error: (message: string) => {
      toast.error(message, {
        style: {
          background: "#16161A",
          color: "#EF4444",
          border: "1px solid #EF4444",
          borderRadius: "12px",
        },
      });
    },
    info: (message: string) => {
      toast(message, {
        style: {
          background: "#16161A",
          color: "#FAFAF9",
          border: "1px solid #2A2A2E",
          borderRadius: "12px",
        },
      });
    },
    loading: (message: string) => {
      return toast.loading(message, {
        style: {
          background: "#16161A",
          color: "#FAFAF9",
          border: "1px solid #2A2A2E",
          borderRadius: "12px",
        },
      });
    },
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId);
    },
  };
}

// Export standalone functions for use outside of React components
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: "#16161A",
        color: "#32D583",
        border: "1px solid #32D583",
        borderRadius: "12px",
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: "#16161A",
        color: "#EF4444",
        border: "1px solid #EF4444",
        borderRadius: "12px",
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      style: {
        background: "#16161A",
        color: "#FAFAF9",
        border: "1px solid #2A2A2E",
        borderRadius: "12px",
      },
    });
  },
};
