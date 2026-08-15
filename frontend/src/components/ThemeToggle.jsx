import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false, variant = 'icon' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Full pill toggle (used in sidebar)
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm transition-colors
          ${isDark
            ? 'bg-[#97CDAB]/15 text-[#97CDAB] hover:bg-[#97CDAB]/25'
            : 'text-forest/75 hover:bg-mist/50'
          } ${className}`}
      >
        {/* track */}
        <div
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0
            ${isDark ? 'bg-[#97CDAB]/40' : 'bg-ink/15'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-sm flex items-center justify-center transition-all duration-300
              ${isDark
                ? 'translate-x-4 bg-[#97CDAB]'
                : 'translate-x-0 bg-white'}`}
          >
            {isDark
              ? <Moon size={9} className="text-[#1B3A2C]" strokeWidth={2.5} />
              : <Sun size={9} className="text-amber-500" strokeWidth={2.5} />
            }
          </span>
        </div>
        <span className="text-sm font-medium">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      </button>
    );
  }

  // Default icon-only toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-full p-2 text-forest/75 hover:text-forest hover:bg-mist/50 transition-colors ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="relative flex items-center justify-center w-5 h-5">
        <Sun
          size={18}
          className={`transition-all duration-300 transform ${
            isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          size={18}
          className={`transition-all duration-300 transform ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
          }`}
        />
      </span>
      {showLabel && (
        <span className="text-xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  );
}
