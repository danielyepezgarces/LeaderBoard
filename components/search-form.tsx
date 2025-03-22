"use client"

import type React from "react"

import { type RefObject, useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useI18n } from "@/components/i18n-provider"
import { TagInput } from "@/components/tag-input"

interface SearchFormProps {
  usernames: string
  startDate: string
  endDate: string
  inputValue: string
  inputRef: RefObject<HTMLInputElement>
  onUsernamesChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  skipNamespaces?: boolean
  onSkipNamespacesChange?: (value: boolean) => void
  domain?: string
}

export function SearchForm({
  usernames,
  startDate,
  endDate,
  inputValue,
  inputRef,
  onUsernamesChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  skipNamespaces = true,
  onSkipNamespacesChange,
  domain = "meta.wikimedia.org",
}: SearchFormProps) {
  const { msg } = useI18n()

  // Convertir la cadena de usernames a un array para el TagInput
  const [userTags, setUserTags] = useState<string[]>([])

  // Inicializar userTags desde usernames
  useEffect(() => {
    if (usernames) {
      const tags = usernames
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
      setUserTags(tags)
    }
  }, [usernames])

  // Mejorar el manejo de los tags
  const handleTagsChange = (newTags: string[]) => {
    setUserTags(newTags)
    // Unir los tags con comas y actualizar el estado de usernames
    const newUsernames = newTags.join(", ")
    onUsernamesChange(newUsernames)
    console.log("Tags updated:", newTags, "Usernames:", newUsernames, "Domain:", domain)
  }

  return (
    <Card className="bg-black/50 border-gray-700 backdrop-blur-sm mb-8 p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="usernames" className="block text-sm font-medium text-gray-200">
              {msg("form.usernames")}
            </label>
            <TagInput
              value={userTags}
              onChange={handleTagsChange}
              placeholder={msg("form.usernames.placeholder")}
              domain={domain}
            />
            {/* Input oculto para mantener compatibilidad con el código existente */}
            <input type="hidden" id="usernames" value={usernames} ref={inputRef} />
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-200">
              {msg("form.startDate")}
            </label>
            <div className="relative">
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                required
                className="bg-gray-900/70 border-gray-700 text-white pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-200">
              {msg("form.endDate")}
            </label>
            <div className="relative">
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                required
                className="bg-gray-900/70 border-gray-700 text-white pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Checkbox id="skipNamespaces" checked={skipNamespaces} onCheckedChange={onSkipNamespacesChange} />
            <label htmlFor="skipNamespaces" className="text-sm font-medium leading-none text-gray-300 cursor-pointer">
              Omitir análisis de espacios de nombres (más rápido)
            </label>
          </div>

          <Button type="submit" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white">
            {userTags.length > 1 ? msg("form.submit.multiple") : msg("form.submit.single")}
          </Button>
        </div>
      </form>
    </Card>
  )
}

