// functions/_middleware.js

/**
 * Cloudflare Pages Middleware to add security headers using a nonce and HTMLRewriter.
 * Updated to support Google Tag Manager (GTM) with 'strict-dynamic'.
 */
export async function onRequest(context) {
  // First, get the response from the asset server.
  const response = await context.next();

  // We only want to modify HTML pages, not images, CSS, etc.
  if (!response.headers.get('content-type')?.startsWith('text/html')) {
    return response;
  }

  // Generate a unique, random nonce for each page view.
  const nonce = crypto.randomUUID().toString().replace(/-/g, '');

  // --- Security Headers ---
  const headers = {
    'Content-Security-Policy': [
      "default-src 'self'",
      // FIX: Added 'strict-dynamic' to allow GTM to load its child tags.
      // We also include 'unsafe-inline' as a fallback for older browsers.
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com 'unsafe-inline'`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      // FIX: Added Google Analytics and GTM domains to img-src for tracking pixels.
      "img-src 'self' data: https://placehold.co https://www.google-analytics.com https://www.googletagmanager.com",
      "frame-src 'self' https://www.googletagmanager.com",
      // FIX: Ensured connect-src allows data to be sent to GA/GTM endpoints.
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),

    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Create a new response with the original headers.
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  // Apply all the new and updated security headers.
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }

  // Use HTMLRewriter to safely add the nonce to all script tags.
  // This will automatically find your GTM <script> in index (7).html and add the nonce.
  return new HTMLRewriter()
    .on('script', {
      element(element) {
        element.setAttribute('nonce', nonce);
      },
    })
    .transform(newResponse);
}
