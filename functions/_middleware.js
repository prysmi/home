// functions/_middleware.js

/**
 * An HTMLRewriter class that adds a nonce to all inline and external scripts.
 * This is necessary to make our Content Security Policy work correctly.
 */
class NonceInjector {
  constructor(nonce) {
    this.nonce = nonce;
  }
  element(element) {
    element.setAttribute("nonce", this.nonce);
  }
}

export async function onRequest(context) {
  // Fetch the original page from the project assets.
  const response = await context.env.ASSETS.fetch(context.request);
  const url = new URL(context.request.url);
  const contentType = response.headers.get("Content-Type") || "";

  // Clone the response so we can modify its headers and body.
  const newResponse = new Response(response.body, response);

  // --- Apply static security headers to all responses ---
  newResponse.headers.set("Access-Control-Allow-Origin", "https://prysmi.com");
  newResponse.headers.set("X-Robots-Tag", "all");
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // --- Apply long-term caching for fonts ---
  if (url.pathname.startsWith("/assets/fonts/")) {
    newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  // --- Apply CSP and nonce only to HTML pages ---
  if (contentType.includes("text/html")) {
    // Generate a unique nonce for each request.
    const nonce = crypto.randomUUID();

    // Define the Content Security Policy.
    const csp = [
      "default-src 'self';",
      // **FIXED**: Added 'https://cdn.jsdelivr.net' to allow modular Three.js to load.
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://cdn.jsdelivr.net;`,
      "style-src 'self' 'unsafe-inline';", // 'unsafe-inline' is often needed for Tailwind's dynamic classes
      "font-src 'self';",
      "img-src 'self' data: raw.githubusercontent.com;",
      "frame-src 'self' https://www.googletagmanager.com;",
      "connect-src 'self' https://www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set("Content-Security-Policy", csp);

    // **FIXED**: Use HTMLRewriter to apply the nonce to script tags.
    // This was the missing piece causing the deployment to fail.
    return new HTMLRewriter()
      .on("script", new NonceInjector(nonce))
      .transform(newResponse);
  }

  return newResponse;
}
