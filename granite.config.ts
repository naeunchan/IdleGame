import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'gaebalgyeon-kiugi',
  brand: {
    displayName: '개발견 키우기',
    primaryColor: '#ff8f3f',
    icon: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=256&q=80',
    bridgeColorMode: 'basic',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'game',
    overScrollMode: 'never',
  },
});

