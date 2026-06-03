type ThemeToggleProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

export function ThemeToggle({ isDarkMode, onToggleTheme }: ThemeToggleProps) {
  return (
    <button
      className="group grid h-12 w-12 shrink-0 place-items-center rounded-full border border-stone-200/80 bg-white text-stone-800 shadow-sm shadow-stone-200/70 transition duration-200 hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-yellow-200 dark:shadow-black/20 dark:hover:border-yellow-300/70 dark:hover:bg-stone-700"
      type="button"
      onClick={onToggleTheme}
      aria-label={isDarkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {isDarkMode ? (
        <svg
          className="h-5 w-5 transition duration-200 group-hover:rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2.5v3M12 18.5v3M4.57 4.57l2.12 2.12M17.31 17.31l2.12 2.12M2.5 12h3M18.5 12h3M4.57 19.43l2.12-2.12M17.31 6.69l2.12-2.12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 transition duration-200 group-hover:-rotate-12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.4 14.5A7.7 7.7 0 0 1 9.5 3.6 8.6 8.6 0 1 0 20.4 14.5Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
