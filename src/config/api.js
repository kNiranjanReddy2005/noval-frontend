const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const isLocalDev = import.meta.env.DEV;

export const API_BASE_URL = configuredApiUrl || (isLocalDev ? "" : "http://localhost:5000");

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractHtmlErrorMessage(payload, status) {
  if (typeof payload !== "string") {
    return "";
  }

  const routeMatch = payload.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^<\s]+)/i);
  if (routeMatch) {
    const [, method, route] = routeMatch;
    return `Backend route unavailable: ${method.toUpperCase()} ${route}. Make sure the backend is restarted or redeployed with the latest routes.`;
  }

  if (payload.includes("<html")) {
    return `Server returned an unexpected HTML error page with status ${status}.`;
  }

  return "";
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
    const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
    const token = localStorage.getItem("token");

    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const htmlMessage = extractHtmlErrorMessage(payload, response.status);
      const message =
        typeof payload === "object" && payload !== null
          ? payload.message
          : htmlMessage || payload;

      if (
        response.status === 401
        && typeof message === "string"
        && /invalid|expired token|no token provided/i.test(message)
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }
}
