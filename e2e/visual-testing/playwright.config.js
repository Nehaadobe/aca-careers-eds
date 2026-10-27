import { defineConfig } from '@playwright/test';
import { getViewports, contextOptionsFor } from './visual/breakpoints.js';
import { CAPTURE_SETTINGS, getRunConfig } from './visual/config.js';
import { validateInventories } from './visual/inventory.js';

const cfg = getRunConfig();
const viewports = getViewports(cfg.edges);
validateInventories(viewports);

export default defineConfig({
  testDir: './visual',
  testMatch: /.*\.spec\.js$/,
  outputDir: './test-results/artifacts',
  fullyParallel: true,
  workers: cfg.workers,
  // a mismatch must stay a failure: no retries until it disappears
  retries: 0,
  forbidOnly: true,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  // references are never written through Playwright's snapshot API (see visual/baseline.js);
  // this is an extra guard in case toHaveScreenshot is ever introduced
  updateSnapshots: 'none',
  globalSetup: './visual/global-setup.js',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./visual/summary-reporter.js'],
  ],
  use: {
    browserName: CAPTURE_SETTINGS.browserName,
    colorScheme: CAPTURE_SETTINGS.colorScheme,
    locale: CAPTURE_SETTINGS.locale,
    timezoneId: CAPTURE_SETTINGS.timezoneId,
    reducedMotion: CAPTURE_SETTINGS.reducedMotion,
    trace: 'retain-on-failure',
    screenshot: 'off',
    video: 'off',
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
  },
  projects: viewports.map((v) => ({
    name: v.name,
    use: contextOptionsFor(v),
    metadata: { viewport: v },
  })),
});
