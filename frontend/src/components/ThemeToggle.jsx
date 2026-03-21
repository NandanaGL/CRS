import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-6 left-6 z-[200] flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 group ${
        isDark
          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          : "bg-black/5 border-black/10 hover:bg-black/10 hover:border-black/20"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            isDark ? "opacity-100 rotate-0 scale-100 text-violet-400" : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
          isDark ? "text-violet-400" : "text-amber-600"
        }`}
      >
        {isDark ? "DARK" : "LIGHT"}
      </span>
    </button>
  );
}