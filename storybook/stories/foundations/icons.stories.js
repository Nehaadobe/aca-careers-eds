import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The client\'s 2026 line icons (`icons/*.svg`), inserted as `:name:`. They are drawn in the text colour (`--icon-color`, `scripts.js` decorateLineIcons), so each brand theme colours them; logos and social icons keep their own colours. All icons with a filter: `/tools/icons/index.html` on any preview.',
      },
    },
  },
};

export const Icons = {
  ...frameStory('foundations/icons', undefined, { minHeight: 1200 }),
  name: 'Icons',
};
