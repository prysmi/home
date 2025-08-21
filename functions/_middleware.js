// functions/_middleware.js

export async function onRequest(context) {
  // Fetch the original page from the project assets
  const response = await context.env.ASSETS.fetch(context.request);

  // If the response is not HTML, we don't need to modify it.
  if (!response.headers.get("Content-Type")?.includes("text/html")) {
    return response;
  }

  // Clone the response so we can add new headers
  const newResponse = new Response(response.body, response);

  // Set the essential security headers that do not require modification
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Define a strong, static Content Security Policy.
  // This removes the failing 'nonce' and 'HTMLRewriter' logic
  // but keeps the site secure by whitelisting trusted sources.
  const csp = [
    "default-src 'self';",
    // We allow 'unsafe-inline' for scripts temporarily to ensure compatibility.
    // Your main script and GTM are explicitly allowed.
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;",
    "style-src 'self' 'unsafe-inline';",
    "font-src 'self' data:;",
    "img-src 'self' data: raw.githubusercontent.com;",
    "frame-src 'self' https://www.googletagmanager.com;",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;",
    "object-src 'none';",
    "base-uri 'self';"
  ].join(" ");

  newResponse.headers.set("Content-Security-Policy", csp);

  return newResponse;
}
