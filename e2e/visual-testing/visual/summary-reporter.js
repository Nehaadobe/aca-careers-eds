/**
 * Concise run summary (console + test-results/visual-summary.{json,md}).
 * Reference mode: promotes the staged capture into the approved set only when every test
 * passed. Compare mode: verifies the approved references were left untouched.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getRunConfig } from './config.js';
import { promoteStaging, snapshotStoreDigest } from './baseline.js';

const OUT_DIR = 'test-results';

function ann(test, result, type) {
  return [...test.annotations, ...result.annotations].find((a) => a.type === type)?.description || '';
}

export default class SummaryReporter {
  constructor() {
    this.rows = [];
  }

  onTestEnd(test, result) {
    const failed = result.status !== 'passed' && result.status !== 'skipped';
    this.rows.push({
      case: ann(test, result, 'case') || test.title,
      viewport: test.parent.project()?.name || '',
      status: result.status,
      failureKind: failed ? (ann(test, result, 'failure-kind') || 'error') : '',
      referenceUrl: ann(test, result, 'reference-url'),
      actualUrl: ann(test, result, 'actual-url'),
      referencePath: ann(test, result, 'reference-path'),
      diff: ann(test, result, 'diff'),
      skipReason: result.status === 'skipped' ? (result.annotations.find((a) => a.type === 'skip')?.description || '') : '',
      error: failed ? (result.error?.message || '').split('\n').slice(0, 2).join(' ') : '',
    });
  }

  async onEnd(result) {
    // global setup did not run (e.g. --list): nothing was captured or compared
    if (!process.env.VISUAL_SETUP_DONE) return undefined;
    let cfg;
    try {
      cfg = getRunConfig();
    } catch (e) {
      return undefined;
    }
    const counts = this.rows.reduce(
      (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
      {},
    );
    const failed = this.rows.filter((r) => !['passed', 'skipped'].includes(r.status));
    let outcome = result.status;
    const notes = [];

    if (cfg.mode === 'reference') {
      const staging = process.env.VISUAL_STAGING_DIR;
      if (result.status === 'passed' && !failed.length && counts.passed) {
        try {
          const { promoted } = promoteStaging(staging, cfg.referenceOrigin);
          notes.push(`Baseline capture: ${promoted.length} reference screenshot(s) approved from ${cfg.referenceOrigin}.`);
          notes.push('This is a capture, not a regression test result. Compare with: VISUAL_BASE_URL=<site> npm run visual');
        } catch (e) {
          notes.push(`Baseline capture NOT saved: ${e.message}`);
          outcome = 'failed';
        }
      } else {
        notes.push('Baseline capture incomplete: no references were added or changed. Fix the failures and capture again.');
        outcome = 'failed';
      }
      if (staging) fs.rmSync(staging, { recursive: true, force: true });
    } else {
      const before = JSON.parse(process.env.VISUAL_STORE_DIGEST || '[]');
      const after = snapshotStoreDigest();
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        notes.push('ERROR: the approved reference store changed during a comparison run.');
        outcome = 'failed';
      } else {
        notes.push(`Approved references unchanged (${after.length} file(s) incl. metadata).`);
      }
    }

    const summary = {
      mode: cfg.mode,
      referenceOrigin: cfg.referenceOrigin,
      actualOrigin: cfg.actualOrigin,
      actualPathPrefix: cfg.actualPathPrefix,
      status: outcome,
      counts,
      notes,
      report: path.join(OUT_DIR, '..', 'playwright-report', 'index.html'),
      results: this.rows,
    };
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'visual-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    const md = [
      `# Visual ${cfg.mode === 'reference' ? 'baseline capture' : 'comparison'}: ${outcome}`,
      '',
      cfg.mode === 'reference' ? `Reference: ${cfg.referenceOrigin}` : `Actual: ${cfg.actualOrigin}${cfg.actualPathPrefix}`,
      '',
      '| Case | Viewport | Result | Failure | URL | Detail |',
      '|---|---|---|---|---|---|',
      ...this.rows.map((r) => `| ${r.case} | ${r.viewport} | ${r.status} | ${r.failureKind} | ${r.actualUrl || r.referenceUrl} | ${(r.error || r.diff || r.skipReason).replace(/\|/g, '\\|')} |`),
      '',
      ...notes,
    ].join('\n');
    fs.writeFileSync(path.join(OUT_DIR, 'visual-summary.md'), `${md}\n`);

    /* eslint-disable no-console */
    console.log(`\n=== Visual ${cfg.mode === 'reference' ? 'baseline capture' : 'comparison'} summary ===`);
    console.log(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('  '));
    failed.forEach((r) => console.log(`  FAIL [${r.failureKind}] ${r.case} @ ${r.viewport}  ${r.actualUrl || r.referenceUrl}\n       ${r.error}`));
    notes.forEach((n) => console.log(n));
    console.log('Report: npm run visual:report   Summary: test-results/visual-summary.md');
    /* eslint-enable no-console */
    return outcome === result.status ? undefined : { status: outcome };
  }
}
