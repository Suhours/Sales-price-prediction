"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 overflow-hidden">
      {/* background motion lights */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-fuchsia-500/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/30 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* glass card */}
      <div className="relative w-full max-w-sm p-8 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] text-white hover:shadow-[0_0_60px_-15px_rgba(255,0,255,0.4)] transition-all">
        {/* logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
            >
              <path strokeWidth="2" d="M4 19V5l8-3 8 3v14l-8 3-8-3z" />
            </svg>
          </div>
          <h1 className="mt-3 text-xl font-bold bg-gradient-to-r from-fuchsia-300 via-pink-400 to-indigo-300 bg-clip-text text-transparent drop-shadow">
            Sales Price Predictor
          </h1>
          <p className="text-xs text-white/70 mt-1">
            Get instant ML-powered price forecasts
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* email */}
          <div>
            <label className="text-xs font-semibold text-white/80">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeWidth="2" d="M4 4h16v16H4z" />
                  <path strokeWidth="2" d="M22 6l-10 7L2 6" />
                </svg>
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/20 bg-white/10 pl-8 pr-3 py-2 text-sm placeholder-white/50 text-white focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label className="text-xs font-semibold text-white/80">
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeWidth="2" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                  <path strokeWidth="2" d="M19.4 15A8 8 0 104.6 9" />
                </svg>
              </span>
              <input
                type={show ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/20 bg-white/10 pl-8 pr-9 py-2 text-sm placeholder-white/50 text-white focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-fuchsia-300 transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="text-xs text-red-300 bg-red-900/30 border border-red-800/40 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* button */}
          <button
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 py-2 text-sm font-medium text-white shadow-lg hover:shadow-fuchsia-500/30 hover:scale-[1.03] transition-all disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className={`transition-transform ${
                  isLoading ? "animate-spin" : "group-hover:translate-x-0.5"
                }`}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="2"
                  className="opacity-30"
                />
                <path strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
              {isLoading ? "Signing in..." : "Sign in"}
            </span>
          </button>

          <p className="text-[11px] text-white/60 text-center mt-2">
            By continuing, you agree to our{" "}
            <span className="text-fuchsia-300 hover:underline cursor-pointer">
              terms & policy
            </span>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
