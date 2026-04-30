const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const isLocalDev = import.meta.env.DEV;

export const API_BASE_URL = configuredApiUrl || (isLocalDev ? "" : "http://localhost:5000");

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getNetworkErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "The request took too long and was cancelled. Please try again.";
  }

  if (error instanceof TypeError) {
    const target = API_BASE_URL || "the frontend dev proxy";
    return `Unable to reach the server through ${target}. Make sure the backend is running on port 5000 and try again.`;
  }

  return error?.message || "Something went wrong while contacting the server.";
}

export async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload !== null
          ? payload.message
          : payload;

      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }
}
