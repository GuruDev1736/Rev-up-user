import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revupbikes.app',
  appName: 'revup',
  webDir: '.next',
  server: {
    url: 'http://192.168.0.108:3000',
    cleartext: true
  }
};

export default config;
