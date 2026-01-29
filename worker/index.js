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

    // Everything else: serve static site (index.html, assets/, img/, images/)
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status !== 404) return res;
    }
    return new Response('Not Found', { status: 404 });
  },
};

async function handleReddit(request, corsHeaders) {

  try {
    const res = await fetch(REDDIT_URL, {
      headers: {
        'User-Agent': 'ProjectGeniusNXT/1.0 (Cloudflare Worker)',
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
