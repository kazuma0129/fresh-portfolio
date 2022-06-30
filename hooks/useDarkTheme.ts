/** @jsx h */
import { h as _h } from 'preact';
import { useState, useCallback, useEffect } from 'preact/hooks';

type UseSimpleDarkMode = (isDark?: boolean) => {
  isDarkMode: boolean;
  toggle: (isDark?: boolean) => void;
};

export const useDarkTheme: UseSimpleDarkMode = (isInitialDark = false) => {
  const [isDarkMode, toggleTheme] = useState<boolean>(isInitialDark);
  const toggle = useCallback((isDark?: boolean) => {
    if (typeof isDark === 'undefined') {
      toggleTheme((state) => !state);
      return;
    }

    toggleTheme(isDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.querySelector('body')?.classList.add('dark:bg-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('body')?.classList.remove('dark:bg-black');
    }
  }, [isDarkMode]);

  return { isDarkMode, toggle };
};
