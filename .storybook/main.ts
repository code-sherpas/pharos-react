import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (viteConfig) => {
    // Strip library-mode-specific config so Storybook can serve a regular SPA.
    // vite.config.ts sets build.lib + dts plugin for publishing the package;
    // neither is useful for the Storybook preview bundle.
    if (viteConfig.build) {
      delete viteConfig.build.lib;
      delete viteConfig.build.rollupOptions;
    }
    viteConfig.plugins = (viteConfig.plugins ?? []).filter((plugin) => {
      if (!plugin || typeof plugin !== 'object' || !('name' in plugin)) return true;
      return plugin.name !== 'vite-plugin-dts';
    });
    return viteConfig;
  },
};

export default config;
