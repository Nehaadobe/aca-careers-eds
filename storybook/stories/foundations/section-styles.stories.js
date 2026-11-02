import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Section styles',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Values of the Section Metadata `style` row: `centered`, `light-blue`, `blue`, and combinations such as `light-blue, centered`. (`two-up` is offered in the library but has no styling yet.)',
      },
    },
  },
};

export const SectionStyles = {
  ...frameStory('foundations/section-styles', undefined, { minHeight: 800 }),
  name: 'Section styles',
};
