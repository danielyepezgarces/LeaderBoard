"use client"

import { Award } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"

interface HeaderProps {
  project: string
  language: string
  onProjectChange: (value: string) => void
  onLanguageChange: (value: string) => void
  getDomain: (project: string, language: string) => string
  wikimediaProjects: { id: string; name: string }[]
  languages: { code: string; name: string }[]
}

export function Header({
  project,
  language,
  onProjectChange,
  onLanguageChange,
  getDomain,
  wikimediaProjects,
  languages,
}: HeaderProps) {
  const { msg } = useI18n()

  return (
    <div className="relative z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 mb-8 py-4 px-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{msg("app.title")}</h1>
          </div>
        </div>

        {/* Controles y selectores */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Project and Language Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm mr-2">{msg("app.subtitle")}:</span>
            <Select value={project} onValueChange={onProjectChange}>
              <SelectTrigger className="w-40 bg-emerald-600 border-emerald-700 text-white">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {wikimediaProjects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {project !== "commons" &&
              project !== "meta" &&
              project !== "species" &&
              project !== "mediawiki" &&
              project !== "wikidata" && (
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-32 bg-emerald-600 border-emerald-700 text-white">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>

          {/* Domain badge */}
          <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-md border border-gray-700 text-sm font-mono">
            {getDomain(project, language)}
          </div>
        </div>
      </div>
    </div>
  )
}

