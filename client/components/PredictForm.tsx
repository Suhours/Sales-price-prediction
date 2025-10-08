"use client";

import { useState } from "react";
import { postPredict } from "@/lib/api";

type ApiResponse = {
  prediction: number;
  model: string;
  input: Record<string, unknown>;
} | { error: string } | unknown;

export default function PredictForm() {
  const [payload, setPayload] = useState<string>(
    JSON.stringify(
      {
        "Units Sold": 100,
        "Unit Price": 50,
        "Unit Cost": 30,
        "Order_Ship_Days": 0,
        "Order Priority": "Medium",
        "Sales Channel": "Offline",
        "Region": "Other",
        "Country": "Other",
        "Item Type": "Other",
        "Order Weekday": "Other",
      },
      null,
      2
    )
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(payload);
      const response = await postPredict(parsed, model);
      setResult(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const [model, setModel] = useState<"lr" | "rf">("lr");

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Model</span>
          <select
            className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-2 py-1"
            value={model}
            onChange={(e) => setModel(e.target.value as "lr" | "rf")}
          >
            <option value="lr">Linear Regression</option>
            <option value="rf">Random Forest</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Prediction payload (JSON)</span>
          <textarea
            className="min-h-[160px] w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {isLoading ? "Predicting..." : "Predict"}
          </button>
          <span className="text-xs text-black/60 dark:text-white/60">
            Endpoint: {process.env.NEXT_PUBLIC_API_BASE_URL ?? "(set NEXT_PUBLIC_API_BASE_URL)"}/predict
          </span>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      {result !== null && (
        <div className="mt-4 rounded-md border border-black/10 dark:border-white/20 p-3 text-sm">
          <div className="text-xs mb-2 font-medium">Response</div>
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}


