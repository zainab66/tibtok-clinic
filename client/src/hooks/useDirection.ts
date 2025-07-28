// src/hooks/useDirection.ts
import { useEffect } from 'react';

export const useDirection = () => {
  const setDirection = (dir: 'ltr' | 'rtl') => {
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
    localStorage.setItem('i18n-dir', dir);
  };

  // Initialize with Arabic/RTL
  useEffect(() => {
    const savedDir = localStorage.getItem('i18n-dir');
    if (!savedDir) {
      setDirection('rtl');
    }
  }, []);

  return { setDirection };
};