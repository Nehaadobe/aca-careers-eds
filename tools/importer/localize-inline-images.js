#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Post-import step: localize inline base64 images.
 *
 * Some careers.blueshieldca.com stories embed images as data: URIs. The importer turns
 * those into session-only blob: URLs, which break after import. For each imported page
 * this script fetches the source page, extracts every data: image inside the article body
 * (in document order), writes it next to the page under content/<dir>/media/, and points
 * the matching blob: image in content/<path>.plain.html at that file (relative URL).
 *
 * Run after `run-bulk-import.js` for a template:
 *   node tools/importer/localize-inline-images.js tools/importer/urls-blog-article.txt
 *
 * Re-running is safe: pages without blob: images are left untouched.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTENT = path.join(ROOT, 'content');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120';

const urls = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
let changed = 0;
urls.forEach((url) => {
  const pagePath = new URL(url).pathname.replace(/\/$/, '') || '/index';
  const plainFile = path.join(CONTENT, `${pagePath}.plain.html`);
  if (!fs.existsSync(plainFile)) return;
  let plain = fs.readFileSync(plainFile, 'utf8');
  const blobs = plain.match(/src="blob:[^"]+"/g) || [];
  if (!blobs.length) return;

  const html = execFileSync('curl', ['-sL', '-A', UA, url], { maxBuffer: 64 * 1024 * 1024 }).toString();
  const body = html.slice(html.indexOf('article-body'));
  const dataUris = [...body.matchAll(/<img[^>]+src="(data:image\/(png|jpe?g|gif|webp);base64,[^"]+)"/gi)].map((m) => ({ uri: m[1], ext: m[2].replace('jpeg', 'jpg') }));
  if (dataUris.length !== blobs.length) {
    console.warn(`! ${pagePath}: ${blobs.length} blob image(s) but ${dataUris.length} inline image(s) in source — skipped`);
    return;
  }
  const slug = path.basename(pagePath);
  const mediaDir = path.join(path.dirname(plainFile), 'media');
  fs.mkdirSync(mediaDir, { recursive: true });
  blobs.forEach((attr, i) => {
    const file = `${slug}-inline-${i + 1}.${dataUris[i].ext}`;
    fs.writeFileSync(path.join(mediaDir, file), Buffer.from(dataUris[i].uri.split(',')[1], 'base64'));
    plain = plain.replace(attr, `src="./media/${file}"`);
  });
  fs.writeFileSync(plainFile, plain);
  changed += 1;
  console.log(`✓ ${pagePath}: ${blobs.length} inline image(s) → ${path.relative(ROOT, mediaDir)}/`);
});
console.log(`done — ${changed} page(s) updated`);
