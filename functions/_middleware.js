export async function onRequest(context) {
  // Fetch the original page from the Pages project assets
  const response = await context.env.ASSETS.fetch(context.request);
  const newResponse = new Response(response.body, response);

  // Set all the static security headers
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // Only run the dynamic CSP logic for HTML pages
  if (newResponse.headers.get("Content-Type")?.includes("text/html")) {
    const nonce = crypto.randomUUID();

    const csp = [
      "default-src 'self';",
      // ADDED 'unsafe-inline' to allow onclick handlers.
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:;`,
      // USED the new, correct hash for the one permitted inline style.
      `style-src 'self' fonts.googleapis.com 'sha256-Scgmef+PrV+zeVvlZq4r84BiJFFDVqo62lDGXLdgghY=';`,
      "font-src 'self' fonts.gstatic.com;",
      // ADDED domains for the blocked images.
      "img-src 'self' data: raw.githubusercontent.com media.licdn.com images.g2crowd.com;",
      "frame-src 'self' www.googletagmanager.com;",
      "connect-src 'self' www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set('Content-Security-Policy', csp);

    // CRITICAL FIX: The rewriter now adds a nonce to ALL script tags,
    // including external ones like three.js.
    const rewriter = new HTMLRewriter().on('script', {
      element(element) {
        element.setAttribute('nonce', nonce);
      },
    });

    return rewriter.transform(newResponse);
  }

  return newResponse;
}
