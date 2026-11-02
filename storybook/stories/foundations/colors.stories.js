import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Color tokens by group, read from styles/brand.css (Blue Shield defaults) with the value resolved for the brand selected in the **Brand** toolbar. Blocks and styles.css use only these tokens (stylelint rejects raw colors), so a theme recolors everything by overriding them.',
      },
    },
  },
};

export const Colors = {
  ...frameStory('__tokens', undefined, { group: 'colors', minHeight: 1200 }),
  name: 'Colors',
};
