/**
 * Classified failure. kind is one of:
 *   config | navigation | readiness | target | missing-baseline | stale-baseline | size | pixels
 */
export class VisualError extends Error {
  constructor(kind, message) {
    super(`[${kind}] ${message}`);
    this.name = 'VisualError';
    this.kind = kind;
  }
}

/** Failure classification for an unknown error (e.g. a Playwright timeout). */
export function kindOf(error, phase) {
  return error instanceof VisualError ? error.kind : phase;
}
