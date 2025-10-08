const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function postPredict(body: unknown, model: "lr" | "rf" = "lr"): Promise<unknown> {
  const response = await fetch(`${API_BASE}/predict?model=${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // `next` config prevents caching for client calls, but kept explicit here
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}

export type OptionsResponse = {
  regions: string[];
  countries: string[];
  items: string[];
  channels: string[];
  priorities: string[];
  weekdays: string[];
};

export async function getOptions(): Promise<OptionsResponse> {
  const response = await fetch(`${API_BASE}/options`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    // avoid caching in client runtime
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return (await response.json()) as OptionsResponse;
}


