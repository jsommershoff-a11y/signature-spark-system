import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.41126098f0644976a8a0b387a8a83999',
  appName: 'KI Automationen',
  webDir: 'dist',
  server: {
    url: 'https://41126098-f064-4976-a8a0-b387a8a83999.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#0F0F0F',
  },
};

export default config;
