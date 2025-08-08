export async function onRequest(context) {
  // Fetch the original page from the Pages project assets.
  const response = await context.env.ASSETS.fetch(context.request);
  const newResponse = new Response(response.body, response);

  // Set all the static security headers.
  newResponse.headers.set("Access-Control-Allow-Origin", "https://prysmi.com"); 
  
  // THE FIX: Explicitly tell search engines to index the site, overriding any defaults.
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
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:;`,
      `style-src 'self' fonts.googleapis.com 'sha256-Scgmef+PrV+zeVvlZq4r84BiJFFDVqo62lDGXLdgghY=';`,
      "font-src 'self' fonts.gstatic.com;",
      "img-src 'self' data: raw.githubusercontent.com media.licdn.com images.g2crowd.com;",
      "frame-src 'self' www.googletagmanager.com;",
      "connect-src 'self' www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    newResponse.headers.set('Content-Security-Policy', csp);

    const rewriter = new HTMLRewriter().on('script', {
      element(element) {
        element.setAttribute('nonce', nonce);
      },
    });

    return rewriter.transform(newResponse);
  }

  // For non-HTML files, just return them with the static headers.
  return newResponse;
}
