import { test } from '@playwright/test';
import { BLOCKS } from './blocks.js';
import { runCase } from './runner.js';

for (const caseDef of BLOCKS) {
  test(`block ${caseDef.id}`, { tag: ['@block', ...caseDef.tags] }, async ({ page, browser }, testInfo) => {
    await runCase({
      spec: 'blocks', kind: 'block', caseDef, page, browser, testInfo,
    });
  });
}
