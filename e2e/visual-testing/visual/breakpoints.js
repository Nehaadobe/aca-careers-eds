/**
 * Viewport projects, derived from the site's real responsive behavior:
 *   576px  header site-name size (header.css)
 *   768px  wider header/footer gutters, utility links in one row (header.css, footer.css)
 *   900px  block layouts change (cards, columns, banner, gallery... *.css)
 *   992px  utility row shown in the header; footer columns side by side
 *   1200px desktop navigation; below it the menu button opens a left drawer (header.js)
 *   1400px wide layouts (styles.css, story listing)
 * The LIVE site uses the same 576/768/992/1200 switch points for its header and footer.
 */

export const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 780, kind: 'phone' },
  { name: 'mobile-390', width: 390, height: 844, kind: 'phone' },
  { name: 'tablet-768', width: 768, height: 1024, kind: 'tablet' },
  { name: 'tablet-900', width: 900, height: 1024, kind: 'tablet' },
  { name: 'laptop-1024', width: 1024, height: 768, kind: 'tablet' },
  { name: 'desktop-1280', width: 1280, height: 800, kind: 'desktop' },
  { name: 'desktop-1440', width: 1440, height: 900, kind: 'desktop' },
  { name: 'wide-1600', width: 1600, height: 900, kind: 'desktop' },
];

/** widths one pixel below each significant breakpoint (added with VISUAL_EDGES=1) */
export const BREAKPOINTS = [576, 768, 900, 992, 1200, 1400];

const EDGE_HEIGHT = 900;

function kindFor(width) {
  if (width < 768) return 'phone';
  if (width < 1200) return 'tablet';
  return 'desktop';
}

/**
 * Viewports to run, including edge widths when requested.
 * @param {boolean} withEdges
 * @returns {Array<{name: string, width: number, height: number, kind: string}>}
 */
export function getViewports(withEdges) {
  const edges = withEdges
    ? BREAKPOINTS.map((bp) => ({
      name: `edge-${bp - 1}`, width: bp - 1, height: EDGE_HEIGHT, kind: kindFor(bp - 1),
    }))
    : [];
  const all = [...VIEWPORTS, ...edges].sort((a, b) => a.width - b.width);
  const names = new Set();
  all.forEach((v) => {
    if (names.has(v.name)) throw new Error(`Duplicate viewport name: ${v.name}`);
    if (!/^[a-z0-9-]+$/.test(v.name)) throw new Error(`Invalid viewport name: ${v.name}`);
    names.add(v.name);
  });
  return all;
}

/**
 * Playwright "use" options for a viewport. Identical for reference capture and comparison.
 * Phones get touch + mobile emulation; tablets get touch only; desktops neither.
 * @param {{width: number, height: number, kind: string}} v
 */
export function contextOptionsFor(v) {
  return {
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 1,
    isMobile: v.kind === 'phone',
    hasTouch: v.kind !== 'desktop',
  };
}
