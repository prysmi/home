// functions/_middleware.js
export async function onRequest(context) {
  // Fetch the original page as-is
  const response = await context.env.ASSETS.fetch(context.request);
  let html = await response.text();

  // Generate a cryptographically secure random nonce for each request
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  // Define a comprehensive and secure Content Security Policy
  const csp = [
    `default-src 'self'`,
    // Allows scripts from your domain and only those with the correct nonce.
    `script-src 'self' 'nonce-${nonce}'`,
    // Allows styles from your domain AND the inline styles from your build process.
    `style-src 'self' 'unsafe-inline'`,
    // Allows images from your domain and data URIs.
    `img-src 'self' data:`,
    // Allows fonts from your domain.
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  // Correctly add the nonce to all script tags (module and classic)
  // This improved regex handles various script tag formats
  html = html.replace(/(<script\s*[^>]*>)/g, (match) => {
    // Avoid adding nonce to scripts with a src attribute (like workers) if not needed,
    // or add it intelligently. For now, we add to all.
    return match.replace('>', ` nonce="${nonce}">`);
  });

  // Create a new response with the modified HTML and the CSP header
  const newResponse = new Response(html, response);
  newResponse.headers.set('Content-Security-Policy', csp);
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');

  return newResponse;
}

