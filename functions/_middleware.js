// functions/_middleware.js

/**
 * Cloudflare Pages Middleware to add security headers.
 * To use this, create a 'functions' directory in the root of your project
 * and place this file inside it.
 */
export async function onRequest(context) {
  // Pass the request to the next function or to the asset server.
  // We wait for the response so we can modify the headers.
  const response = await context.next();

  // --- Security Headers ---
  const headers = {
    // Content-Security-Policy: The most complex header. It controls where resources can be loaded from.
    'Content-Security-Policy': [
      "default-src 'self'", // By default, only allow resources from our own domain.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com", // Allow scripts from our domain, inline scripts, and Google Tag Manager. 'unsafe-inline' is needed for your theme-switcher script inside the HTML.
      "style-src 'self' 'unsafe-inline'", // Allow CSS from our domain and inline styles (e.g., style='...').
      "font-src 'self'", // Allow fonts from our own domain (e.g., /assets/fonts/...).
      "img-src 'self' data: https://placehold.co", // Allow images from our domain, data URIs, and the placeholder service.
      "frame-src 'self' https://www.googletagmanager.com", // Allow iframes from our domain and Google Tag Manager (for the noscript fallback).
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com", // Defines valid endpoints for fetch() or XHR requests.
      "object-src 'none'", // Disallow plugins like <object>, <embed>, or <applet>.
      "base-uri 'self'", // Restricts the URLs which can be used in a document's <base> element.
      "form-action 'self'", // Restricts the URLs which can be used as the target of a form submission.
    ].join('; '),

    // Strict-Transport-Security: Enforces HTTPS.
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Content-Type-Options: Prevents MIME-sniffing.
    'X-Content-Type-Options': 'nosniff',

    // X-Frame-Options: Prevents clickjacking by blocking the site from being rendered in an <iframe>.
    'X-Frame-Options': 'DENY',

    // Referrer-Policy: Controls how much referrer information is sent with requests.
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions-Policy: Controls which browser features can be used.
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Apply the headers to the response.
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
