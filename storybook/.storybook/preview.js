/**
 * Brand switcher: the toolbar "Brand" sets the theme every story renders with
 * (same values as the `theme` page metadata). "Page default" keeps the fixture's own
 * theme: Blue Shield everywhere except the Stellarus pages.
 * Shareable as a URL, e.g. ?path=/story/blocks-hero--hero-page&globals=brand:stellarus
 */
/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  globalTypes: {
    brand: {
      description: 'Brand theme',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'auto', title: 'Page default' },
          { value: 'bsc', title: 'Blue Shield of California' },
          { value: 'stellarus', title: 'Stellarus' },
          { value: 'ascendiun', title: 'Ascendiun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: 'auto' },
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Guides', ['Intro', 'Authoring blocks', 'Brands and themes', 'Adding a block', 'Adding a brand'],
          'Foundations', ['Colors', 'Typography', 'Spacing and shapes', 'Buttons', 'Section styles'],
          'Blocks', 'Page templates',
        ],
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        laptop: { name: 'Laptop 1024', styles: { width: '1024px', height: '768px' } },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
};

export default preview;
