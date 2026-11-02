import { frameStory } from '../../src/frame.js';

export default {
  title: 'Foundations/Buttons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Authors make a button by formatting a link that sits alone in its paragraph: **bold** = solid button, *italic* = outline button, bold and italic = high-impact button. An unformatted link stays a text link. Inside a blue section the buttons switch to their on-blue colors.',
      },
    },
  },
};

export const Buttons = {
  ...frameStory('foundations/buttons', undefined, { minHeight: 500 }),
  name: 'Buttons',
};
