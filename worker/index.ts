/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const CACHE_CONTROL_IMMUTABLE = "public, max-age=31536000, immutable";
const CACHE_CONTROL_DEFAULT = "public, max-age=0, must-revalidate";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (shouldServeSinglePageAppFallback(request, response, url)) {
      const indexUrl = new URL("/index.html", url);
      const indexRequest = new Request(indexUrl.toString(), request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    const headers = new Headers(response.headers);

    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    if (isImmutableAsset(url)) {
      headers.set("Cache-Control", CACHE_CONTROL_IMMUTABLE);
    } else if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", CACHE_CONTROL_DEFAULT);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;

function shouldServeSinglePageAppFallback(request: Request, response: Response, url: URL): boolean {
  if (response.status !== 404) {
    return false;
  }

  if (request.method !== "GET") {
    return false;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/.well-known/")) {
    return false;
  }

  return !url.pathname.includes(".");
}

function isImmutableAsset(url: URL): boolean {
  return url.pathname.startsWith("/assets/");
}
