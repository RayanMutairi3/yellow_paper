import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = window.localStorage.getItem(key);
      if (savedValue) return JSON.parse(savedValue) as T;

      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    } catch {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage can fail in restricted browser modes.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
