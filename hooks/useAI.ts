"use client";

import { useState } from "react";
import { AIAction, AIRequest } from "@/app/api/ai/route";

export interface AIResult {
  result: string;
}

export interface UseAIReturn {
  loading: boolean;
  error: string | null;
  result: string | null;
  call: (params: AIRequest) => Promise<string | null>;
  reset: () => void;
}

export const useAI = (): UseAIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const call = async (params: AIRequest): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg =
          data?.error ||
          "Error al procesar la solicitud de IA. Intenta de nuevo.";
        setError(msg);
        return null;
      }

      setResult(data.result ?? "");
      return data.result ?? "";
    } catch {
      const msg = "Error de conexión. Verifica tu internet e intenta de nuevo.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return { loading, error, result, call, reset };
};

export type { AIAction };
