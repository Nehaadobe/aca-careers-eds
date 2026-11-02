import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Careers sites · Storybook',
    brandImage: '/favicons/bsc.png',
    colorPrimary: '#0071bc',
    colorSecondary: '#0071bc',
  }),
});
