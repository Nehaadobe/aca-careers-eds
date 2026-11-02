import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Font families and the size scale of the selected brand, then default content (headings, paragraphs, links, lists) as styled by styles/styles.css. Blue Shield uses the Adobe Fonts kit (Proxima Nova, Trade Gothic Next Condensed); Stellarus self-hosts Inter, Space Grotesk and JetBrains Mono.',
      },
    },
  },
};

export const Tokens = {
  ...frameStory('__tokens', undefined, { group: 'type', minHeight: 600 }),
  name: 'Typography tokens',
};

export const DefaultContent = {
  ...frameStory('foundations/typography', undefined, { minHeight: 600 }),
  name: 'Default content',
};
