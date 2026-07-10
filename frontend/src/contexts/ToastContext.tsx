import React, { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = (message: string, type: ToastType = "success") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast.info(message);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
