import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.UNESCOAIED.edupx',
  appName: 'EduPX',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'dify.playwithiai.com',
      '101.201.45.187',
      'playwithiai.com'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
