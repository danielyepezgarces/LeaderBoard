"use client"

import { useI18n } from "@/components/i18n-provider"
import { AVAILABLE_LOCALES } from "@/lib/i18n"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()

  const handleLanguageChange = (value: string) => {
    setLocale(value)
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-400" />
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 bg-gray-800/70 border-gray-700 text-white">
          <SelectValue placeholder="UI Language" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {AVAILABLE_LOCALES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

