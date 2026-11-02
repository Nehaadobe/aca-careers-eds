/**
 * Storybook for the careers sites.
 *
 * Stories render the real site: every story loads /sb-frame.html in an iframe, which builds an
 * Edge Delivery Services page from a content fixture and runs the site's own scripts, styles,
 * themes and blocks. The site folders are served unchanged at their site paths, so the site
 * itself needs no build step and no Storybook-specific code.
 */
import remarkGfm from 'remark-gfm';

const SITE_FOLDERS = ['blocks', 'scripts', 'styles', 'fonts', 'icons', 'favicons'];

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  framework: '@storybook/html-vite',
  stories: [
    '../stories/guides/*.mdx',
    '../stories/foundations/*.stories.js',
    '../stories/blocks/*.stories.js',
    '../stories/templates/*.stories.js',
  ],
  addons: [{
    name: '@storybook/addon-docs',
    // tables in the guides (GitHub-flavored Markdown)
    options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
  }],
  staticDirs: [
    // site code at its site paths (/blocks, /scripts, /styles, ...)
    ...SITE_FOLDERS.map((folder) => ({ from: `../../${folder}`, to: `/${folder}` })),
    // frame page, content fixtures and mock data (/nav.plain.html, /blog/query-index.json, ...)
    '../public',
  ],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  // browser tab icon: the Blue Shield favicon instead of Storybook's
  managerHead: (head) => `${head}
    <script>document.querySelectorAll('link[rel~="icon"]').forEach((link) => link.remove());</script>
    <link rel="icon" type="image/png" href="./favicons/bsc.png" />`,
};

export default config;
