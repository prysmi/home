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
        // Added LinkedIn (snap.licdn.com) and Zoho (cdn.pagesense.io) to allow scripts to load
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://snap.licdn.com https://cdn.pagesense.io 'unsafe-inline'`,
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self'",
        // Added LinkedIn (px.ads.linkedin.com) and Zoho (pagesense-collect.zoho.in) for tracking pixels
        "img-src 'self' data: https://placehold.co https://www.google-analytics.com https://www.googletagmanager.com https://px.ads.linkedin.com https://snap.licdn.com https://pagesense-collect.zoho.in",
        "frame-src 'self' https://www.googletagmanager.com",
        // Added LinkedIn and Zoho to connect-src to fix the "Fetch API" and "Connecting to..." errors
        "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://px.ads.linkedin.com https://pagesense-collect.zoho.in",
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


