"use client";

import { X, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />,
    success: (
      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
    ),
    error: (
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
    ),
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-lg shadow-2xl p-4 pr-12 max-w-md">
        <div className="flex items-start gap-3">
          {icons[type]}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
