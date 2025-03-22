"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createI18nContext, type I18nContext as I18nContextType, DEFAULT_LOCALE, AVAILABLE_LOCALES } from "@/lib/i18n"

// Create a React context for i18n
const I18nContext = createContext<I18nContextType>(createI18nContext())

// Hook to use i18n in components
export const useI18n = () => useContext(I18nContext)

// Provider component for i18n
export const I18nProvider: React.FC<{
  children: React.ReactNode
  initialLocale?: string
}> = ({ children, initialLocale = DEFAULT_LOCALE }) => {
  // Create the i18n context
  const [i18nContext, setI18nContext] = useState<I18nContextType>(() => createI18nContext(initialLocale))

  // Update the context when the locale changes
  const setLocale = (locale: string) => {
    setI18nContext((prevContext) => {
      const newContext = { ...prevContext }
      newContext.setLocale(locale)
      newContext.locale = locale
      return newContext
    })

    // Store the locale preference in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("uiLocale", locale)
    }
  }

  // Load the locale from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocale = localStorage.getItem("uiLocale")
      if (storedLocale && AVAILABLE_LOCALES.some((l) => l.code === storedLocale)) {
        setLocale(storedLocale)
      } else {
        // Try to detect browser language
        const browserLocale = navigator.language.split("-")[0]
        if (browserLocale && AVAILABLE_LOCALES.some((l) => l.code === browserLocale)) {
          setLocale(browserLocale)
        }
      }
    }
  }, [])

  // Create the context value
  const contextValue: I18nContextType = {
    ...i18nContext,
    setLocale,
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

