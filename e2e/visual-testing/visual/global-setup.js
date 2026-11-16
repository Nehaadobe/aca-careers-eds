/**
 * Runs once before the workers start.
 * Reference mode: creates the staging folder and refuses early when existing references are
 * incompatible. Compare mode: records the reference store digest so the reporter can prove
 * the comparison left references untouched.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getRunConfig, STAGING_ROOT, SCREENSHOT_DIR } from './config.js';
import { readMeta, settingsFingerprint, snapshotStoreDigest } from './baseline.js';

export default async function globalSetup() {
  const cfg = getRunConfig();
  // tells the summary reporter that tests actually ran (not set for --list)
  process.env.VISUAL_SETUP_DONE = '1';
  if (cfg.mode === 'reference') {
    const meta = readMeta();
    if (meta && (meta.referenceOrigin !== cfg.referenceOrigin || meta.settingsFingerprint !== settingsFingerprint())) {
      throw new Error(`Existing references in ${SCREENSHOT_DIR} came from ${meta.referenceOrigin} with settings `
        + `${meta.settingsFingerprint}; this capture uses ${cfg.referenceOrigin} with ${settingsFingerprint()}. `
        + 'They were left unchanged. Delete visual/__screenshots__ to capture a new set.');
    }
    // leftovers from interrupted captures are incomplete by definition (successful or failed
    // runs remove their own staging folder); they are never promoted, so clear them
    fs.rmSync(STAGING_ROOT, { recursive: true, force: true });
    const dir = path.join(STAGING_ROOT, `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`);
    fs.mkdirSync(dir, { recursive: true });
    process.env.VISUAL_STAGING_DIR = dir;
    console.log(`\nBaseline capture from ${cfg.referenceOrigin} (staging: ${path.relative(process.cwd(), dir)})\n`);
  } else {
    process.env.VISUAL_STORE_DIGEST = JSON.stringify(snapshotStoreDigest());
    const prefix = cfg.actualPathPrefix ? ` (path prefix ${cfg.actualPathPrefix})` : '';
    console.log(`\nComparing ${cfg.actualOrigin}${prefix} (${cfg.actualProfile} markup profile) against approved LIVE references\n`);
  }
}
