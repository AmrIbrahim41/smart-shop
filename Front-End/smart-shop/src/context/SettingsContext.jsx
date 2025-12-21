// src/context/SettingsContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../translations"; // استدعاء ملف الترجمة

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // 1. إعدادات اللغة (بنجيبها من اللوكال ستوريج أو الديفولت انجليزي)
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  
  // 2. إعدادات الثيم (الديفولت دارك)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // 👇 تأثير تغيير اللغة (اتجاه الصفحة)
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("lang", language);
  }, [language]);

  // 👇 تأثير تغيير الثيم (كلاسات Tailwind)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // دالة التبديل
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // دالة الترجمة (تُستخدم في الصفحات)
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, theme, toggleLanguage, toggleTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingsContext);
};