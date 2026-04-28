"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  icon?: React.ReactNode;
}

export function Loading({ text = "Cargando...", fullScreen = false, icon }: LoadingProps) {
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-12";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          {icon ? (
            <div className="relative z-10 animate-bounce">{icon}</div>
          ) : (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
          )}
        </div>
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
      </div>
    </div>
  );
}
