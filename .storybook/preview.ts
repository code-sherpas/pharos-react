import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: 'var(--pharos-color-base-white)' },
        { name: 'neutral-50', value: 'var(--pharos-color-neutral-50)' },
        { name: 'neutral-900', value: 'var(--pharos-color-neutral-900)' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  tags: ['autodocs'],
};

export default preview;
