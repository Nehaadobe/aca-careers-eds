import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Component tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Named measurements of single blocks (header layouts, footer layouts, hero, banner, cards, story listing, columns, accordion and others), for values that are not on a shared scale. Blocks use these instead of raw values; a theme can override any of them.',
      },
    },
  },
};

export const ComponentTokens = {
  ...frameStory('__tokens', undefined, { group: 'components', minHeight: 600 }),
  name: 'Component tokens',
};
