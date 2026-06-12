// Generates per-route static HTML with correct meta tags after vite build.
// Runs as part of `npm run build`, so it executes on Vercel too.
import { readFileSync, writeFileSync } from 'fs';

const SITE = 'https://bantertoolbox.com';

const routes = {
  'index.html': {
    title: 'The Banter Toolbox — Free AI World Cup 2026 Tools',
    desc: 'Free AI tools for the tournament group chat: get your World Cup predictions roasted by an AI pundit, and generate official excuses for your team\'s heartbreak. No signup.',
    url: `${SITE}/`,
    image: `${SITE}/og/home.png`,
  },
  'roast.html': {
    title: 'AI Roasts Your World Cup Predictions — Banter Toolbox',
    desc: 'Pick your World Cup 2026 predictions and get brutally roasted by an AI pundit. Free, no signup, instantly shareable.',
    url: `${SITE}/roast`,
    image: `${SITE}/og/roast.png`,
  },
  'excuse.html': {
    title: 'Fan Excuse Generator — Official AI Cope for Your Team',
    desc: 'Your team lost? Get a certified AI excuse with an official denial rating. Free, no signup, made for the group chat.',
    url: `${SITE}/excuse`,
    image: `${SITE}/og/excuse.png`,
  },
};

const base = readFileSync('dist/index.html', 'utf8');

for (const [file, m] of Object.entries(routes)) {
  let html = base
    // replace existing title and description
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${m.title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${m.desc}">`);

  const tags = `
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="The Banter Toolbox">
    <meta property="og:title" content="${m.title}">
    <meta property="og:description" content="${m.desc}">
    <meta property="og:url" content="${m.url}">
    <meta property="og:image" content="${m.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${m.title}">
    <meta name="twitter:description" content="${m.desc}">
    <meta name="twitter:image" content="${m.image}">
  </head>`;

  html = html.replace('</head>', tags);
  writeFileSync(`dist/${file}`, html);
  console.log(`✓ wrote dist/${file} with OG tags`);
}
