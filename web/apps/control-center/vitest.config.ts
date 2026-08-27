import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@__SLUG__/components': path.resolve(__dirname, 'node_modules/@__SLUG__/components/dist/src/index.js'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
      '@mui/system': path.resolve(__dirname, 'node_modules/@mui/system'),
      '@mui/x-data-grid': path.resolve(__dirname, 'node_modules/@mui/x-data-grid'),
      '@mui/x-internals': path.resolve(__dirname, 'node_modules/@mui/x-internals'),
      '@mui/utils': path.resolve(__dirname, 'node_modules/@mui/utils'),
      '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    exclude: ['node_modules', 'dist', 'test/e2e/**'],
    server: {
      deps: {
        inline: ['@__SLUG__/components', /@mui\//, /@emotion\//],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'src/index.tsx',
        'src/routes.tsx',
        'src/config/**',
        'src/components/utils/loadingState.ts', // re-exported from @__SLUG__/components, tested there
        'src/DashboardAuthenticationWrapper.tsx',
        'src/components/layout/DashboardOverview.tsx', // complex demo layout, tested via e2e
        'src/test-setup.ts',
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
});
