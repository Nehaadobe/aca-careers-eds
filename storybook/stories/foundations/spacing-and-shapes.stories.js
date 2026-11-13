import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Spacing and shapes',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The spacing scale, section spacing, content widths, corner radii, border and outline widths, the stacking order (z-index), control sizes, shadows and motion of the selected brand. The content width steps with the viewport (540 / 720 / 960 / 1140 / 1320px for Blue Shield), so values here depend on the viewport toolbar.',
      },
    },
  },
};

export const SpacingAndShapes = {
  ...frameStory('__tokens', undefined, { group: 'space', minHeight: 600 }),
  name: 'Spacing and shapes',
};
