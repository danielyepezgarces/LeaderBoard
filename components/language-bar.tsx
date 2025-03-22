"use client"

import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { AVAILABLE_LOCALES } from "@/lib/i18n"

export function LanguageBar() {
  const { locale, setLocale } = useI18n()

  const handleUILanguageChange = (value: string) => {
    setLocale(value)
  }

  return (
    <div className="relative z-20 bg-gray-900/90 border-b border-gray-800">
      <div className="container mx-auto px-4 py-2 flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400 text-sm mr-2">UI Language:</span>
          <Select value={locale} onValueChange={handleUILanguageChange}>
            <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white text-sm">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LOCALES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

