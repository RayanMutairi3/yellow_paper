import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

export function Header({ isDarkMode, onToggleTheme }: HeaderProps) {
  return (
    <header className="pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-950 dark:text-stone-50">
            الورقة الصفراء
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            اكتبها بسرعة… ورتّبها على راحتك
          </p>
        </div>

        <ThemeToggle isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      </div>
    </header>
  );
}
