// functions/_middleware.js
/*
export async function onRequest(context) {
  // Fetch the original page
  const response = await context.env.ASSETS.fetch(context.request);
  let html = await response.text();

  // Generate a unique nonce for each request
  const nonce = crypto.randomUUID();

  // Add the nonce to all script tags for a strict CSP
  html = html.replace(/<script/g, `<script nonce="${nonce}"`);

  // --- STRICT CONTENT SECURITY POLICY (CSP) ---
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: raw.githubusercontent.com",
    "frame-src 'self' https://www.googletagmanager.com",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Create a new response
  const newResponse = new Response(html, response);

  // --- SET ALL SECURITY HEADERS ---
  newResponse.headers.set('Content-Security-Policy', csp);
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // --- THIS IS THE FIX ---
  // Replace the wildcard with your specific domain for a stricter CORS policy.
  newResponse.headers.set('Access-Control-Allow-Origin', 'https://prysmi.com');

  // Set cache control for the HTML page
  newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

  return newResponse;
}
*/
