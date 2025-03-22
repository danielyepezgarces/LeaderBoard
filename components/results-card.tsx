"use client"

import { useState } from "react"
import { ChevronDown, Share2, Download, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { ShareDialog } from "@/components/share-dialog"

interface ResultsCardProps {
  loading: boolean
  resultCount: number
  resultWikipedia: any[]
  usernames: string
  startDate: string
  endDate: string
  detailedUserData: any[]
  onShareLink: () => void
  onExportCSV: () => void
  onExportJSON: () => void
  dateFormat: (dateStr: string) => string
  project?: string
  language?: string
}

export function ResultsCard({
  loading,
  resultCount,
  resultWikipedia,
  usernames,
  startDate,
  endDate,
  detailedUserData,
  onShareLink,
  onExportCSV,
  onExportJSON,
  dateFormat,
  project = "wikipedia",
  language = "en",
}: ResultsCardProps) {
  const { msg } = useI18n()
  const [showShareDialog, setShowShareDialog] = useState(false)

  // Crear URL para compartir
  const getShareUrl = () => {
    if (typeof window === "undefined") {
      return ""
    }

    const url = new URL(window.location.href)
    url.searchParams.set("usernames", usernames)
    url.searchParams.set("startDate", startDate)
    url.searchParams.set("endDate", endDate)
    url.searchParams.set("project", project)
    url.searchParams.set("language", language)
    return url.toString()
  }

  // Título para compartir
  const getShareTitle = () => {
    return `Wiki Leaderboard: ${usernames} (${dateFormat(startDate)} - ${dateFormat(endDate)})`
  }

  return (
    <Card className="bg-black/50 border-gray-700 backdrop-blur-sm p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div>
          {resultCount < 0 ? (
            <div className="text-center text-gray-400 py-16">{msg("results.noData")}</div>
          ) : resultWikipedia.length === 0 ? (
            <div className="text-center text-gray-400 py-16">{msg("results.noResults")}</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h4 className="text-lg font-medium text-white mb-2 sm:mb-0">
                  {msg("results.title", dateFormat(startDate), dateFormat(endDate))}
                </h4>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {msg("results.share")}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                        <Download className="h-4 w-4 mr-2" />
                        {msg("results.export")}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={onExportCSV}>{msg("results.export.csv")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={onExportJSON}>{msg("results.export.json")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-800/50 border-gray-700 p-4 text-center">
                  <h5 className="text-2xl font-bold text-white">{resultCount}</h5>
                  <span className="text-gray-400">{msg("results.contributions")}</span>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700 p-4 text-center">
                  <h5 className="text-2xl font-bold text-white">{usernames.split(",").length}</h5>
                  <span className="text-gray-400">{msg("results.participants")}</span>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700 p-4 text-center">
                  <h5 className="text-2xl font-bold text-white">
                    {Math.round(resultCount / usernames.split(",").length)}
                  </h5>
                  <span className="text-gray-400">{msg("results.average")}</span>
                </Card>
              </div>

              <div className="space-y-3">
                {resultWikipedia.map((user, index) => (
                  <div
                    key={index}
                    className={cn("flex flex-col p-3 rounded-lg", index < 3 ? "bg-gray-800/70" : "bg-gray-900/40")}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-sm text-gray-400">
                          {user.count} {msg("results.contributions")}
                        </div>
                      </div>
                      {index < 3 && (
                        <Award
                          className={cn(
                            "h-6 w-6",
                            index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700",
                          )}
                        />
                      )}
                    </div>

                    {/* Additional data */}
                    {detailedUserData[index] && (
                      <div className="mt-3 pl-12 text-sm text-gray-300 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-400">{msg("results.registered")}: </span>
                            {detailedUserData[index].registrationDate !== "Unknown"
                              ? new Date(detailedUserData[index].registrationDate).toLocaleDateString()
                              : "Unknown"}
                          </div>
                          <div>
                            <span className="text-gray-400">{msg("results.editSummary")}: </span>
                            {detailedUserData[index].editSummaryPercentage}%
                          </div>
                        </div>

                        {detailedUserData[index].topEdits && detailedUserData[index].topEdits.length > 0 && (
                          <div className="mt-2">
                            <span className="text-gray-400 block mb-1">{msg("results.topEdit")}:</span>
                            <div className="text-xs truncate">{detailedUserData[index].topEdits[0].title}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Diálogo de compartir */}
      {typeof window !== "undefined" && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          shareUrl={getShareUrl()}
          title={getShareTitle()}
        />
      )}
    </Card>
  )
}

