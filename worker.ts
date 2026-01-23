
/**
 * Cisco IOS Insight - Cloudflare Worker
 * 
 * This worker manages static asset delivery and provides SPA-friendly 
 * routing fallbacks with production-grade security headers.
 */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      // 1. Initial attempt to fetch the asset from the binding
      let response = await env.ASSETS.fetch(request);

      /**
       * 2. SPA Fallback Logic
       * If the asset is not found (404) and it's a GET request, we evaluate
       * if it should be handled by the client-side router.
       */
      if (response.status === 404 && request.method === 'GET') {
        const path = url.pathname;
        
        // Check if the path looks like a static asset (has a file extension)
        // We exclude .html as those might be valid SPA entry points or legacy docs
        const lastSegment = path.split('/').pop() || '';
        const isAssetRequest = lastSegment.includes('.') && !lastSegment.endsWith('.html');

        if (!isAssetRequest) {
          // It's a navigation route (e.g., /dashboard), so we serve index.html
          const indexRequest = new Request(new URL('/index.html', url), request);
          response = await env.ASSETS.fetch(indexRequest);
        }
      }

      // 3. Global Header Injection
      // We create a new response to modify headers while preserving the status and body stream
      const headers = new Headers(response.headers);
      
      // Standard security headers for a networking tool
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Ensure the browser doesn't try to sniff types if we are serving index.html as a fallback
      if (url.pathname === '/' || response.headers.get('content-type')?.includes('text/html')) {
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        // Allow caching for versioned assets (JS/CSS)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

    } catch (err) {
      // Graceful error reporting for the worker environment
      console.error('Worker Routing Error:', err);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};
