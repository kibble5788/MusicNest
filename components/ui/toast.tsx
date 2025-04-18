"use client"

import type React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md w-full animate-slide-up z-50",
        type === "success" && "bg-emerald-500 text-white",
        type === "error" && "bg-red-500 text-white",
        type === "info" && "bg-blue-500 text-white",
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center space-y-2 p-4 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  )
}
