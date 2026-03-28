"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  const currentIndex = themes.findIndex((t) => t.value === theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const handleToggle = () => {
    setTheme(nextTheme.value);
  };

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon || Sun;

  return (
    <button
      onClick={handleToggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Tema actual: ${theme}. Cambiar a ${nextTheme.label}`}
      title={`Cambiar a ${nextTheme.label}`}
    >
      <CurrentIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
    </button>
  );
}
