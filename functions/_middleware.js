// functions/_middleware.js

// This class will be used by HTMLRewriter to add a nonce to script tags.
class NonceInjector {
  constructor(nonce) {
    this.nonce = nonce;
  }
  element(element) {
    element.setAttribute('nonce', this.nonce);
  }
}

export async function onRequest(context) {
  // Fetch the original asset
  const response = await context.env.ASSETS.fetch(context.request);
  const url = new URL(context.request.url);

  // If the response is not HTML, we don't need to do anything.
  if (!response.headers.get("Content-Type")?.includes("text/html")) {
    return response;
  }

  // Clone the response so we can modify headers
  let newResponse = new Response(response.body, response);

  // Set standard security headers
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Generate a unique nonce for this request
  const nonce = crypto.randomUUID();

  // Define the Content Security Policy
  const csp = [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com;`,
    "style-src 'self' 'unsafe-inline';", // 'unsafe-inline' is needed for the inlined <style> tag
    "font-src 'self';",
    "img-src 'self' data: raw.githubusercontent.com;",
    "frame-src 'self' https://www.googletagmanager.com;",
    "connect-src 'self' https://www.google-analytics.com;",
    "object-src 'none';",
    "base-uri 'self';"
  ].join(" ");
  newResponse.headers.set("Content-Security-Policy", csp);

  // Use the HTMLRewriter to inject the nonce into every script tag
  return new HTMLRewriter()
    .on('script', new NonceInjector(nonce))
    .transform(newResponse);
}
