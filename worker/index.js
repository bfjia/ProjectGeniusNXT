/**
 * Cloudflare Worker: serves static site (ASSETS) and proxies Reddit API at /api/reddit.
 *
 * Reddit often returns 403 on www.reddit.com .json from server/datacenter IPs.
 * Try old.reddit.com first (usually works), then www as fallback — see r/redditdev.
 */

const REDDIT_JSON_URLS = [
  'https://old.reddit.com/r/EarthPorn/top/.json?sort=top&t=week',
  'https://www.reddit.com/r/EarthPorn/top/.json?sort=top&t=week',
];

/** https://github.com/reddit-archive/reddit/wiki/API — unique, descriptive UA */
const REDDIT_HEADERS = {
  'User-Agent': 'web:bfjia.net:homepage:v1 (by /u/bfjia)',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

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

    // /presentations → profile presentations section
    if (url.pathname === '/presentations' || url.pathname === '/presentations/') {
      return Response.redirect('https://bfjia.net/profile#presentations', 301);
    }

    // /about → profile
    if (url.pathname === '/about' || url.pathname === '/about/') {
      const target = new URL('/profile' + url.search, request.url);
      return Response.redirect(target.href, 301);
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
  let lastStatus = 0;
  let lastUrl = '';

  try {
    for (const redditUrl of REDDIT_JSON_URLS) {
      lastUrl = redditUrl;
      const res = await fetch(redditUrl, {
        headers: REDDIT_HEADERS,
        redirect: 'follow',
      });

      lastStatus = res.status;

      if (!res.ok) {
        continue;
      }

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        continue;
      }

      if (json?.data?.children && Array.isArray(json.data.children)) {
        return new Response(JSON.stringify(json), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Reddit API error',
        status: lastStatus,
        tried: REDDIT_JSON_URLS,
        hint: 'Reddit may block JSON from some IPs; old.reddit.com is tried first.',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: String(err.message),
        lastUrl,
        lastStatus,
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
