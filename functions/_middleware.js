// functions/_middleware.js

/**
 * Cloudflare Pages Middleware to add security headers using a nonce for scripts.
 * This is the recommended approach for getting an A+ on securityheaders.com
 * while still allowing necessary inline scripts to run.
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

  // Read the original HTML content from the response.
  let html = await response.text();

  // Inject the nonce into every script tag.
  // This tells the browser that these specific scripts are trusted.
  html = html.replaceAll('<script', `<script nonce="${nonce}"`);

  // --- Security Headers ---
  const headers = {
    // Content-Security-Policy: Updated to use the nonce.
    'Content-Security-Policy': [
      "default-src 'self'",
      // IMPORTANT: We've removed 'unsafe-inline' and added the nonce.
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' is generally safer for styles than scripts.
      "font-src 'self'",
      "img-src 'self' data: https://placehold.co",
      "frame-src 'self' https://www.googletagmanager.com",
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

  // Create a new response with the modified HTML.
  const newResponse = new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers, // Start with original headers
  });

  // Apply all the new and updated security headers.
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }

  return newResponse;
}

