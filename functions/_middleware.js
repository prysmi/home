export async function onRequest(context) {
  // Fetch the original page from the Pages project assets.
  const response = await context.env.ASSETS.fetch(context.request);
  const newResponse = new Response(response.body, response);

  // Set all the static security headers.
  newResponse.headers.set("Access-Control-Allow-Origin", "https://prysmi.com");
  // Tell search engines to index the site.
  newResponse.headers.set("X-Robots-Tag", "all");
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // Only apply the dynamic CSP logic to HTML pages.
  if (newResponse.headers.get("Content-Type")?.includes("text/html")) {
    const nonce = crypto.randomUUID();

    const csp = [
      "default-src 'self';",
      // Tight script-src: nonce, strict-dynamic, https -- and explicitly allow Cloudflare's email decode script
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: https://prysmi.com/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js;`,
      `style-src 'self' fonts.googleapis.com 'sha256-Scgmef+PrV+zeVvlZq4r84BiJFFDVqo62lDGXLdgghY=';`,
      "font-src 'self' fonts.gstatic.com;",
      "img-src 'self' data: raw.githubusercontent.com media.licdn.com images.g2crowd.com;",
      "frame-src 'self' www.googletagmanager.com;",
      "connect-src 'self' www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set('Content-Security-Policy', csp);

    // Add nonce to all script tags, including Cloudflare's injected one.
    const rewriter = new HTMLRewriter().on('script', {
      element(element) {
        element.setAttribute('nonce', nonce);
      }
    });

    return rewriter.transform(newResponse);
  }

  // For non-HTML files, just return with security headers.
  return newResponse;
}
