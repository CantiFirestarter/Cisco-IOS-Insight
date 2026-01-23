
/**
 * Cloudflare Worker Entry Point
 * 
 * This worker handles routing for the Cisco IOS Insight application.
 * It serves static assets from the provided directory and fallbacks to index.html
 * for SPA (Single Page Application) routing support.
 */

interface Env {
  // The ASSETS binding is automatically provided by Cloudflare 
  // when "assets" is configured in wrangler.json
  ASSETS: {
    fetch: typeof fetch;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Attempt to serve the request from static assets
    const response = await env.ASSETS.fetch(request);

    /**
     * SPA Routing Logic:
     * If the asset is not found (404) and it's a browser request (GET),
     * we serve index.html so the React app can handle the route client-side.
     */
    if (response.status === 404 && request.method === 'GET') {
      const indexRequest = new Request(new URL('/index.html', url), request);
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
