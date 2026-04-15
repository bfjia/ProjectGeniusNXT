/**
 * Cloudflare Worker: serves static site (ASSETS) and proxies Reddit API at /api/reddit.
 */

const REDDIT_URL = 'https://www.reddit.com/r/EarthPorn/top/.json?sort=top&t=week';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect www.bfjia.net → bfjia.net (301 permanent)
    if (url.hostname === 'www.bfjia.net') {
      const target = `https://bfjia.net${url.pathname}${url.search}`;
      return Response.redirect(target, 301);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API: proxy Reddit (no CORS / no corsproxy.io)
    if (request.method === 'GET' && url.pathname === '/api/reddit') {
      return handleReddit(request, corsHeaders);
    }

    // Everything else: serve static site; on 404, serve 404.html if present
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status !== 404) return res;
      const notFoundUrl = new URL('/404.html', request.url);
      const notFoundRes = await env.ASSETS.fetch(new Request(notFoundUrl, { method: 'GET' }));
      if (notFoundRes.ok) {
        return new Response(notFoundRes.body, {
          status: 404,
          statusText: 'Not Found',
          headers: notFoundRes.headers,
        });
      }
    }
    return new Response('Not Found', { status: 404 });
  },
};

async function handleReddit(request, corsHeaders) {

  try {
    const res = await fetch(REDDIT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Reddit API error', status: res.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const json = await res.json();
    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: String(err.message) }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
