import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revupbikes.app',
  appName: 'revup',
  webDir: '.next',
  server: {
    url: 'https://revupbikes.com',
    cleartext: false
  }
};

export default config;
