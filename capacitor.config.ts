import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tflh.chat',
  appName: 'TFLH Chat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4F46E5",
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#4F46E5',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
