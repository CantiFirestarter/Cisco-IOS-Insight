
/**
 * Cisco IOS Insight - Cloudflare Worker
 * 
 * Provides an entry point for Cloudflare Workers with Assets.
 * This worker handles standard asset fetching and provides fallback 
 * routing for Single Page Application (SPA) functionality.
 */

// Define Fetcher interface locally to resolve "Cannot find name 'Fetcher'"
interface Fetcher {
  fetch: (request: Request | string, init?: RequestInit) => Promise<Response>;
}

// Define ExecutionContext interface locally to resolve "Cannot find name 'ExecutionContext'"
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  /**
   * The ASSETS binding provides access to the static files 
   * defined in the assets.directory of wrangler.json.
   */
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // First, try to serve the static asset from the binding (e.g., /index.tsx, /docs/README.html)
    let response = await env.ASSETS.fetch(request);

    /**
     * SPA Routing Logic:
     * If the resource is not found (404) and the path does not appear to be
     * a direct file request (i.e., the last part of the path has no dot), 
     * we fallback to index.html. This allows React to handle the routing internally.
     */
    if (response.status === 404 && !url.pathname.split('/').pop()?.includes('.')) {
      const indexRequest = new Request(new URL('/index.html', request.url).toString());
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
