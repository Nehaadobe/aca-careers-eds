/**
 * Story helper: renders a content fixture in an iframe running the site (see public/sb-frame.js).
 * The iframe grows to its content height, so docs pages show whole blocks and pages.
 */
let frameCount = 0;

/**
 * @param {object} options
 * @param {string} options.fixture fixture path, e.g. 'blocks/hero', 'pages/index', '__tokens'
 * @param {number} [options.section] keep only this section of the fixture
 * @param {boolean} [options.chrome] show the site header and footer
 * @param {string} [options.group] token group for the '__tokens' view
 * @param {number} [options.minHeight] initial height before the content reports its size
 * @param {object} context Storybook story context (reads the "Brand" toolbar)
 * @returns {HTMLIFrameElement}
 */
export function renderFrame({
  fixture, section, chrome = false, group, minHeight = 200,
}, context) {
  frameCount += 1;
  const id = `sb-frame-${frameCount}`;
  const query = new URLSearchParams({
    fixture, theme: context.globals.brand || 'auto', chrome: chrome ? '1' : '0', id,
  });
  if (section !== undefined) query.set('section', String(section));
  if (group) query.set('group', group);

  const iframe = document.createElement('iframe');
  iframe.src = `/sb-frame.html?${query}`;
  iframe.title = `${fixture}${section !== undefined ? ` (example ${section + 1})` : ''}`;
  iframe.style.cssText = `display:block;width:100%;height:${minHeight}px;border:0;`;
  const onMessage = (event) => {
    if (event.data?.sbFrame !== id || event.source !== iframe.contentWindow) return;
    iframe.style.height = `${event.data.height}px`;
  };
  window.addEventListener('message', onMessage);
  return iframe;
}

/**
 * Story factory for one fixture section.
 * @param {string} fixture
 * @param {number} [section]
 * @param {object} [options] extra renderFrame options
 */
export function frameStory(fixture, section, options = {}) {
  return {
    render: (args, context) => renderFrame({ fixture, section, ...options }, context),
  };
}
