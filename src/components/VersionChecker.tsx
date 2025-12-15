import { useEffect } from 'react';

const APP_VERSION = '1.0.8'; // REBUILT: Mobile-first architecture
const VERSION_KEY = 'tflh_app_version';

export function VersionChecker() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== APP_VERSION) {
      console.log('🔄 Major rebuild:', storedVersion, '->', APP_VERSION);
      
      const userAuth = localStorage.getItem('tflh_user');
      localStorage.clear();
      if (userAuth) {
        localStorage.setItem('tflh_user', userAuth);
      }
      
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  return null;
}
