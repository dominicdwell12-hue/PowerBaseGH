// Static hosting alone can't give WhatsApp/Facebook/Twitter a correct
// preview for a specific product, because those crawlers never execute
// JavaScript — they only ever see the raw HTML of the very first response.
// This tiny server sits in front of the built SPA and, ONLY for requests
// that identify as a known social/search crawler, rewrites the <head> of
// index.html with real Open Graph tags for whatever page was requested
// before sending it. Every real visitor (i.e. every browser) gets the
// exact same static SPA as before — this changes nothing about the app
// itself, its routing, or its behavior for humans.
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

// Runtime API base (server-side fetches) — separate from VITE_API_BASE_URL,
// which only affects the client bundle at build time. Falls back to the
// same value so a single env var still works if only one is set.
const API_BASE_URL =
  process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const SITE_URL = (process.env.SITE_URL || 'https://powerbase-storefront.onrender.com').replace(/\/$/, '');

// Origin of the real backend, with no /api/v1 suffix — used only to know
// where to forward proxied requests to (see the /api proxy below).
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN || API_BASE_URL.replace(/\/api\/v1\/?$/, '')).replace(
  /\/$/,
  ''
);

// Every crawler that actually renders link previews for a shared URL.
// Googlebot/Bingbot are included too — pre-rendered meta tags are more
// reliable than depending on their JS renderer, and it costs nothing for
// human visitors either way.
const BOT_USER_AGENT_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|redditbot|vkShare|Applebot|Googlebot|bingbot|SkypeUriPreview/i;

const app = express();

// Forward every /api/* call straight through to the real backend, so the
// browser only ever talks to this one domain. This is what actually fixes
// login sessions on iPhone: iOS Safari (and every browser on iOS, since
// they all share Apple's engine) blocks third-party cookies outright —
// no cookie attribute can override that. With the API and storefront on
// different subdomains, the login cookie was always "third-party" from
// Safari's point of view and got silently discarded. Proxying through
// here makes it a same-origin, first-party cookie instead.
// Must be registered before the bot/SPA routes below, so /api requests
// never fall through to that logic.
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_ORIGIN,
    changeOrigin: true,
    // Express strips the '/api' mount prefix from req.url before this
    // middleware ever sees it — without this, requests would be forwarded
    // to the backend missing that prefix (e.g. /v1/auth/login instead of
    // the real /api/v1/auth/login) and 404.
    pathRewrite: (path) => `/api${path}`,
  })
);

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readIndexHtml() {
  return fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
}

function withMetaTags(html, { title, description, image, url }) {
  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Arcvan Ghana Limited" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  `;

  return html
    .replace(/<title>.*?<\/title>/is, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace('</head>', `${head}\n  </head>`);
}

function bestImage(product) {
  return product?.images?.find((img) => img.isPrimary)?.imageUrl ?? product?.images?.[0]?.imageUrl ?? null;
}

// Generic (but always real) fallback used for every non-product page a bot
// requests — homepage, /products, /cart, etc. Refreshed every 15 minutes
// from the real featured-products endpoint rather than fetched on every
// single bot hit.
let siteDefaultsCache = { fetchedAt: 0, image: null };
const SITE_DEFAULTS_TTL_MS = 15 * 60 * 1000;

async function getSiteDefaultImage() {
  if (Date.now() - siteDefaultsCache.fetchedAt < SITE_DEFAULTS_TTL_MS) {
    return siteDefaultsCache.image;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    if (response.ok) {
      const { data } = await response.json();
      const image = bestImage(data?.[0]) ?? null;
      siteDefaultsCache = { fetchedAt: Date.now(), image };
    }
  } catch (err) {
    console.error('[ssr-meta] Failed to refresh site default image:', err.message);
  }
  return siteDefaultsCache.image;
}

const SITE_DESCRIPTION =
  'Real products at real cedi prices, delivered across Ghana. Pay on delivery in Kumasi, or by card and Mobile Money anywhere else.';

app.get('/products/:slug', async (req, res, next) => {
  if (!BOT_USER_AGENT_PATTERN.test(req.get('user-agent') || '')) return next();

  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(req.params.slug)}`);
    if (!response.ok) return next();

    const { data } = await response.json();
    const product = data?.product;
    if (!product) return next();

    const price = Number(product.price).toFixed(2);
    const description = product.description
      ? product.description.slice(0, 160)
      : `${product.name} — GH₵${price} at Arcvan Ghana Limited.`;

    const html = withMetaTags(readIndexHtml(), {
      title: `${product.name} — GH₵${price} | Arcvan Ghana Limited`,
      description,
      image: bestImage(product) ?? (await getSiteDefaultImage()),
      url: `${SITE_URL}/products/${product.slug}`,
    });

    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error('[ssr-meta] Failed to render product meta tags:', err.message);
    return next();
  }
});

app.get('*', async (req, res, next) => {
  // Only static asset requests fall through untouched; every other GET
  // (any app route a bot might hit) gets the generic real-image fallback.
  const looksLikeAsset = path.extname(req.path) !== '';
  if (looksLikeAsset) return next();

  if (!BOT_USER_AGENT_PATTERN.test(req.get('user-agent') || '')) {
    res.set('Content-Type', 'text/html');
    return res.send(readIndexHtml());
  }

  const html = withMetaTags(readIndexHtml(), {
    title: 'Arcvan Ghana Limited — Lighting & Home Essentials, Delivered Across Ghana',
    description: SITE_DESCRIPTION,
    image: await getSiteDefaultImage(),
    url: `${SITE_URL}${req.path}`,
  });

  res.set('Content-Type', 'text/html');
  return res.send(html);
});

app.use(express.static(DIST_DIR, { index: false }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Storefront server (static + bot-aware OG tags) running on port ${PORT}`);
});
