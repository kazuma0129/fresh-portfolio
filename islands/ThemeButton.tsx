import { useDarkTheme } from "../hooks/useDarkTheme.ts";

export default () => {
  const { isDarkMode, toggle } = useDarkTheme();
  return (
    <header className="flex items-center justify-end mb-4" role="banner">
      <button
        type="button"
        onClick={() => toggle()}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span className="text-base" aria-hidden="true">
          {isDarkMode ? '☀️' : '🌙'}
        </span>
      </button>
    </header>
  );
};
