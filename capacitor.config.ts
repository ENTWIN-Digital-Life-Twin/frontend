import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitallifetwin.app',
  appName: 'ENTWIN',
  webDir: 'dist/digital-life-twin/browser',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
