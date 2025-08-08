export async function onRequest(context) {
  // Fetch the original page from the Pages project assets.
  const response = await context.env.ASSETS.fetch(context.request);
  const newResponse = new Response(response.body, response);

  // Set all the static security headers. These are best practices.
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // Only apply the dynamic CSP logic to HTML pages.
  if (newResponse.headers.get("Content-Type")?.includes("text/html")) {
    const nonce = crypto.randomUUID();

    // This CSP is built from all the error logs and AI suggestions.
    const csp = [
      "default-src 'self';",
      
      // FIX for inline event handlers (onclick). This will get the site working.
      // Your score may temporarily be an 'A' instead of 'A+' because of this.
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:;`,
      
      // FIX for the single required inline style, using the correct hash.
      `style-src 'self' fonts.googleapis.com 'sha256-Scgmef+PrV+zeVvlZq4r84BiJFFDVqo62lDGXLdgghY=';`,
      
      "font-src 'self' fonts.gstatic.com;",
      
      // FIX for all blocked images.
      "img-src 'self' data: raw.githubusercontent.com media.licdn.com images.g2crowd.com;",

      "frame-src 'self' www.googletagmanager.com;",
      "connect-src 'self' www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set('Content-Security-Policy', csp);

    // THE MOST CRITICAL FIX: This rewriter adds the nonce to ALL script tags,
    // including external ones like three.js and the Cloudflare email script.
    const rewriter = new HTMLRewriter().on('script', {
      element(element) {
        element.setAttribute('nonce', nonce);
      },
    });

    return rewriter.transform(newResponse);
  }

  // For non-HTML files (like CSS), just return them with the static headers.
  return newResponse;
}
