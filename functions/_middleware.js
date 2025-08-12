// functions/_middleware.js

export async function onRequest(context) {
  // Fetch the original page from the Pages project assets
  const response = await context.env.ASSETS.fetch(context.request);

  // Clone the original response so we can modify headers
  const newResponse = new Response(response.body, response);

  // --- Static Security Headers ---
  newResponse.headers.set("Access-Control-Allow-Origin", "https://prysmi.com");
  newResponse.headers.set("X-Robots-Tag", "all");
  newResponse.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=()"
  );
  newResponse.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // --- CSP for HTML pages only ---
  if (newResponse.headers.get("Content-Type")?.includes("text/html")) {
    const nonce = crypto.randomUUID();

    const csp = [
      "default-src 'self';",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://prysmi.com/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js;`,
      "style-src 'self' fonts.googleapis.com 'sha256-Scgmef+PrV+zeVvlZq4r84BiJFFDVqo62lDGXLdgghY=';",
      "font-src 'self' fonts.gstatic.com;",
      "img-src 'self' data: raw.githubusercontent.com;",
      "frame-src 'self' https://www.googletagmanager.com;",
      "connect-src 'self' https://www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set("Content-Security-Policy", csp);

    // Inject the nonce attribute into all <script> tags
    const rewriter = new HTMLRewriter().on("script", {
      element(element) {
        element.setAttribute("nonce", nonce);
      }
    });

    return rewriter.transform(newResponse);
  }

  return newResponse;
}
