"use client"

import type React from "react"
import { useState, useRef, type KeyboardEvent } from "react"
import { X, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  domain?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Agregar usuario...",
  disabled = false,
  domain = "meta.wikimedia.org",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Función para agregar una etiqueta
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !value.includes(trimmedTag)) {
      const newTags = [...value, trimmedTag]
      onChange(newTags)
      setInputValue("")
    }
  }

  // Función para eliminar una etiqueta
  const removeTag = (index: number) => {
    const newTags = [...value]
    newTags.splice(index, 1)
    onChange(newTags)
  }

  // Manejar teclas especiales (Enter, Backspace, coma)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-900/70 border border-gray-700 rounded-md min-h-[42px]">
        {value.map((tag, index) => (
          <div key={index} className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded-md">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-gray-700"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}

        <div className="flex-1 min-w-[120px]">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="h-8 bg-transparent border-0 p-0 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400">
        {value.length > 0
          ? "Presiona Enter o coma para agregar un usuario. Haz clic en X para eliminar."
          : "Escribe un nombre de usuario y presiona Enter para agregarlo."}
      </div>
    </div>
  )
}

