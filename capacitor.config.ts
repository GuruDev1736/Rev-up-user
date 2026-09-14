import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revupbikes.app',
  appName: 'revup',
  webDir: '.next',
  server: {
    url: 'https://beta.revupbikes.com',
    cleartext: false
  }
};

export default config;
