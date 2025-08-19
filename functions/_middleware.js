// functions/_middleware.js

/**
 * A fallback function to generate a random UUID, compatible with older Node.js versions.
 * @returns {string} A random UUID string.
 */
function generateNonce() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class NonceInjector {
  constructor(nonce) {
    this.nonce = nonce;
  }
  element(element) {
    element.setAttribute("nonce", this.nonce);
  }
}

export async function onRequest(context) {
  const response = await context.env.ASSETS.fetch(context.request);
  const url = new URL(context.request.url);
  const contentType = response.headers.get("Content-Type") || "";

  const newResponse = new Response(response.body, response);

  newResponse.headers.set("Access-Control-Allow-Origin", "https://prysmi.com");
  newResponse.headers.set("X-Robots-Tag", "all");
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  if (url.pathname.startsWith("/assets/fonts/")) {
    newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  if (contentType.includes("text/html")) {
    // **FIXED**: Using the compatible 'generateNonce()' function instead of 'crypto.randomUUID()'.
    const nonce = generateNonce();

    const csp = [
      "default-src 'self';",
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://cdn.jsdelivr.net;`,
      "style-src 'self' 'unsafe-inline';",
      "font-src 'self';",
      "img-src 'self' data: raw.githubusercontent.com;",
      "frame-src 'self' https://www.googletagmanager.com;",
      "connect-src 'self' https://www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set("Content-Security-Policy", csp);

    return new HTMLRewriter()
      .on("script", new NonceInjector(nonce))
      .transform(newResponse);
  }

  return newResponse;
}
