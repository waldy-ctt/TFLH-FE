import { useEffect } from 'react';

const APP_VERSION = '1.0.6'; // CRITICAL FIX - Stopped infinite render loop
const VERSION_KEY = 'tflh_app_version';

export function VersionChecker() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== APP_VERSION) {
      // Clear all local storage except user auth
      const userAuth = localStorage.getItem('tflh_user');
      localStorage.clear();
      if (userAuth) {
        localStorage.setItem('tflh_user', userAuth);
      }
      
      // Set new version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      
      // Clear service worker cache if exists
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Force hard reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  return null;
}
