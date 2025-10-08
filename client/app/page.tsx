"use client";

import { useEffect, useState } from "react";
import { postPredict, getOptions, type OptionsResponse } from "@/lib/api";

type ModelKey = "lr" | "rf";

export default function Home() {
  const [model, setModel] = useState<ModelKey>("rf");
  // Use strings so inputs can be cleared without reverting to 0
  const [unitsSold, setUnitsSold] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [orderShipDays, setOrderShipDays] = useState<string>("");
  const [orderPriority, setOrderPriority] = useState<string>("Medium");
  const [salesChannel, setSalesChannel] = useState<string>("Offline");
  const [region, setRegion] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [orderWeekday, setOrderWeekday] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usErr, setUsErr] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);
  const [ucErr, setUcErr] = useState<string | null>(null);
  const [predLR, setPredLR] = useState<number | null>(null);
  const [predRF, setPredRF] = useState<number | null>(null);

  // Options from server
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getOptions();
        if (!cancelled) setOptions(res);
      } catch (err) {
        if (!cancelled) setOptionsError("Failed to load options");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Lightweight toast for success/error messages
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  function showToast(t: { type: "success" | "error"; message: string }) {
    setToast(t);
    setTimeout(() => setToast(null), 2500);
  }

  async function reloadOptions() {
    setOptionsError(null);
    try {
      const res = await getOptions();
      setOptions(res);
    } catch {
      setOptionsError("Failed to load options");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (model === "lr") setPredLR(null); else setPredRF(null);
    setUsErr(null); setUpErr(null); setUcErr(null);
    try {
      // basic required validation
      const missing: string[] = [];
      if (unitsSold.trim() === "") { setUsErr("Required"); missing.push("Units Sold"); }
      if (unitPrice.trim() === "") { setUpErr("Required"); missing.push("Unit Price"); }
      if (unitCost.trim() === "") { setUcErr("Required"); missing.push("Unit Cost"); }
      if (missing.length) throw new Error(`Please fill required fields: ${missing.join(", ")}`);

      const body = {
        "Units Sold": Number(unitsSold),
        "Unit Price": Number(unitPrice),
        "Unit Cost": Number(unitCost),
        "Order_Ship_Days": orderShipDays.trim() === "" ? 0 : Number(orderShipDays),
        "Order Priority": orderPriority,
        "Sales Channel": salesChannel,
        "Region": region.trim() === "" ? "Other" : region,
        "Country": country.trim() === "" ? "Other" : country,
        "Item Type": itemType.trim() === "" ? "Other" : itemType,
        "Order Weekday": orderWeekday.trim() === "" ? "Other" : orderWeekday,
      };
      const res = (await postPredict(body, model)) as any;
      if (res?.error) throw new Error(res.error);
      const nextVal = typeof res?.prediction === "number" ? res.prediction : null;
      if (model === "lr") setPredLR(nextVal); else setPredRF(nextVal);
      if (nextVal !== null) {
        showToast({ type: "success", message: `Prediction ready for ${model === "lr" ? "Linear Regression" : "Random Forest"}` });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
      showToast({ type: "error", message: err instanceof Error ? err.message : "Prediction failed" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden p-4 sm:p-6 bg-white">
      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50">
        {toast && (
          <div className={`pointer-events-auto flex items-center gap-2 rounded-lg px-3 py-2 shadow-md text-sm animate-[fadein_.2s_ease-out] ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {toast.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M20 6L9 17l-5-5"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
      {/* Accents removed for a fully clean white background */}

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">Sales Price Predictor</h1>
          <span className="badge animate-[fadein_.3s_ease-out]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 3l2.09 6.26H20l-5.17 3.76L16.18 21 12 16.9 7.82 21l1.35-7.98L4 9.26h5.91L12 3z"/></svg>
            ML Powered
          </span>
        </div>
        <p className="text-center text-[11px] text-black/60 mt-1">Fill details to estimate price • API: {process.env.NEXT_PUBLIC_API_BASE_URL}/predict</p>

        {optionsError && (
          <div className="mt-3 mx-auto max-w-3xl rounded-md border border-red-500/30 bg-red-50 p-3 text-sm text-red-700 flex items-center justify-between">
            <span>Dropdown options failed to load. Ensure the server is running and dataset is available.</span>
            <button type="button" onClick={reloadOptions} className="rounded-md bg-red-600 text-white px-2 py-1 text-xs hover:bg-red-700">Retry</button>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-black/10 glass p-3 shadow-sm">
              <h2 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-indigo-600"><path strokeWidth="2" d="M12 6v6l4 2"/></svg>
                Enter Specifications
              </h2>
              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 3v18h18"/></svg>
                    Units Sold
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter units sold"
                    className={`mt-1 w-full rounded-md border p-2 bg-transparent text-sm placeholder:text-black/40 focus:ring-2 focus:ring-indigo-500 ${usErr ? "border-red-500" : "border-black/10"}`}
                    value={unitsSold}
                    onChange={(e) => setUnitsSold(e.target.value)}
                  />
                  {usErr && <p className="mt-1 text-xs text-red-600">{usErr}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 12h16M12 4v16"/></svg>
                    Unit Price
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter unit price"
                    className={`mt-1 w-full rounded-md border p-2 bg-transparent text-sm placeholder:text-black/40 focus:ring-2 focus:ring-indigo-500 ${upErr ? "border-red-500" : "border-black/10"}`}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                  {upErr && <p className="mt-1 text-xs text-red-600">{upErr}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M20 7H4m16 5H8m12 5H4"/></svg>
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter unit cost"
                    className={`mt-1 w-full rounded-md border p-2 bg-transparent text-sm placeholder:text-black/40 focus:ring-2 focus:ring-indigo-500 ${ucErr ? "border-red-500" : "border-black/10"}`}
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                  />
                  {ucErr && <p className="mt-1 text-xs text-red-600">{ucErr}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 7h18M7 3v18"/></svg>
                    Order Ship Days
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter ship days (optional)"
                    className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm placeholder:text-black/40 focus:ring-2 focus:ring-indigo-500"
                    value={orderShipDays}
                    onChange={(e) => setOrderShipDays(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Order Priority</label>
                  <select className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm" value={orderPriority} onChange={(e) => setOrderPriority(e.target.value)}>
                    <option value="">Select priority</option>
                    {(options?.priorities ?? ["Low","Medium","High","Critical"]).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Sales Channel</label>
                  <select className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm" value={salesChannel} onChange={(e) => setSalesChannel(e.target.value)}>
                    <option value="">Select channel</option>
                    {(options?.channels ?? ["Offline","Online"]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 2l4 8H8l4-8zm0 20a4 4 0 100-8 4 4 0 000 8z"/></svg>
                    Region
                  </label>
                  <select disabled={!options} className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm disabled:opacity-60" value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="">Select region</option>
                    {(options?.regions ?? []).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 5h18v14H3z"/></svg>
                    Country
                  </label>
                  <select disabled={!options} className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm disabled:opacity-60" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="">Select country</option>
                    {(options?.countries ?? []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16"/></svg>
                    Item Type
                  </label>
                  <select disabled={!options} className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm disabled:opacity-60" value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="">Select item type</option>
                    {(options?.items ?? []).map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Order Weekday</label>
                  <select className="mt-1 w-full rounded-md border border-black/10 p-2 bg-transparent text-sm" value={orderWeekday} onChange={(e) => setOrderWeekday(e.target.value)}>
                    <option value="">Select weekday (optional)</option>
                    {(options?.weekdays ?? [
                      "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Other",
                    ]).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => setModel("lr")} className={`rounded-md border p-3 text-left hover:shadow-sm transition-shadow ${model === "lr" ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-black/10"}`}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 20V4m0 8l5-3 4 6 7-10"/></svg>
                        Predictor 1
                      </div>
                      <div className="text-xs text-black/60">Linear Regression</div>
                    </button>
                    <button type="button" onClick={() => setModel("rf")} className={`rounded-md border p-3 text-left hover:shadow-sm transition-shadow ${model === "rf" ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-black/10"}`}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 4h16M4 10h10M4 16h7"/></svg>
                        Predictor 2
                      </div>
                      <div className="text-xs text-black/60">Random Forest</div>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button type="submit" disabled={isLoading} className="group w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 py-2.5 text-white text-sm font-medium shadow-md hover:shadow-xl hover:scale-[1.01] transition-transform duration-200 disabled:opacity-60">
                    <span className="inline-flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`transition-transform ${isLoading ? "animate-spin" : "group-hover:translate-x-0.5"}`}><circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-30"/><path strokeWidth="2" d="M12 6v6l4 2"/></svg>
                      {isLoading ? "Predicting..." : "Predict Price"}
                    </span>
                  </button>
                </div>
              </form>
              {error && <div className="mt-4 rounded-md border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>
          </div>

            <div className="lg:col-span-1 space-y-3">
            <div className="rounded-xl border border-black/10 glass p-3 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Price Prediction</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`rounded-md border p-2.5 transition-transform ${model === "lr" ? "border-indigo-500" : "border-black/10"}`}>
                  <div className="text-xs text-black/60">Linear Regression</div>
                  <div className="text-xl font-bold will-change-transform hover:scale-[1.03] transition-transform">{predLR !== null ? predLR.toLocaleString() : "—"}</div>
                </div>
                <div className={`rounded-md border p-2.5 transition-transform ${model === "rf" ? "border-indigo-500" : "border-black/10"}`}>
                  <div className="text-xs text-black/60">Random Forest</div>
                  <div className="text-xl font-bold will-change-transform hover:scale-[1.03] transition-transform">{predRF !== null ? predRF.toLocaleString() : "—"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 glass p-3 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Selected Features</h3>
              <ul className="text-xs grid grid-cols-2 gap-2">
                <li>Units Sold: {unitsSold || "—"}</li>
                <li>Unit Price: {unitPrice || "—"}</li>
                <li>Unit Cost: {unitCost || "—"}</li>
                <li>Ship Days: {orderShipDays || 0}</li>
                <li>Priority: {orderPriority}</li>
                <li>Channel: {salesChannel}</li>
                <li>Region: {region || "—"}</li>
                <li>Country: {country || "—"}</li>
                <li>Item: {itemType || "—"}</li>
                <li>Weekday: {orderWeekday || "—"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
