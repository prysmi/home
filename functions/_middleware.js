export async function onRequest(context) {
  // Fetch the original page from the Pages project assets.
  // `context.env.ASSETS` is automatically available because of the `functions` directory.
  const response = await context.env.ASSETS.fetch(context.request);

  // Clone the response to make the headers mutable
  const newResponse = new Response(response.body, response);

  // Set all the static security headers
  newResponse.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // Only run the dynamic CSP logic for HTML pages
  if (newResponse.headers.get("Content-Type")?.includes("text/html")) {
    
    // Generate a new, unique nonce for this specific visitor
    const nonce = crypto.randomUUID();

    // Construct the A+ grade CSP header, injecting the new nonce
    const csp = [
      "default-src 'self';",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:;`,
      "style-src 'self' fonts.googleapis.com;",
      "font-src 'self' fonts.gstatic.com;",
      "img-src 'self' data: raw.githubusercontent.com;",
      "frame-src 'self' www.googletagmanager.com;",
      "connect-src 'self' www.google-analytics.com;",
      "object-src 'none';",
      "base-uri 'self';"
    ].join(" ");

    // Set the dynamic Content-Security-Policy header
    newResponse.headers.set('Content-Security-Policy', csp);

    // Create the rewriter to inject the same nonce into all inline scripts
    const rewriter = new HTMLRewriter().on('script', {
      element(element) {
        if (!element.getAttribute('src')) {
          element.setAttribute('nonce', nonce);
        }
      },
    });

    // Return the HTML response, transformed with nonces and all headers
    return rewriter.transform(newResponse);
  }

  // For non-HTML assets (CSS, images), return the response with just the static headers
  return newResponse;
}
