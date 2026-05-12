import type { Preview } from '@storybook/react-vite';

import '../src/styles.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    backgrounds: {
      default: 'archon-dark',
      values: [
        { name: 'archon-dark', value: '#111217' },
        { name: 'high-contrast', value: '#000000' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    layout: 'padded',
  },
  globalTypes: {
    mode: {
      description: 'UI mode matrix',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: ['dark', 'high-contrast', 'reduced-motion', 'responsive'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const mode = typeof context.globals.mode === 'string' ? context.globals.mode : 'dark';
      return (
        <div
          className={mode === 'high-contrast' ? 'dark contrast-more' : 'dark'}
          data-ui-mode={mode}
          style={{ minHeight: '100vh' }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
