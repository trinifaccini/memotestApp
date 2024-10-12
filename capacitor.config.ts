import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.memotest',
  appName: 'Memotest',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#52092f', // Color de fondo en hexadecimal
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
  };

export default config;
