import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tflh.chat',
  appName: 'TFLH Chat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For local development testing:
    // url: 'http://192.168.1.XXX:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4F46E5",
      showSpinner: false,
    },
  },
};

export default config;
