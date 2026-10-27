import { test } from '@playwright/test';
import { PAGES } from './pages.js';
import { runCase } from './runner.js';

for (const caseDef of PAGES) {
  test(`page ${caseDef.id}`, { tag: ['@page', ...caseDef.tags] }, async ({ page, browser }, testInfo) => {
    await runCase({
      spec: 'pages', kind: 'page', caseDef, page, browser, testInfo,
    });
  });
}
