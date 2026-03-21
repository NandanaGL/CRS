import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("crs-theme");
    return stored ? stored === "dark" : true; // default dark
  });

  useEffect(() => {
    localStorage.setItem("crs-theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}