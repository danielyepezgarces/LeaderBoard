"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { LoadingProgress } from "@/services/wiki-api"

interface LoadingProgressDialogProps {
  isOpen: boolean
  onClose: () => void
  progressData: LoadingProgress[]
}

export function LoadingProgressDialog({ isOpen, onClose, progressData }: LoadingProgressDialogProps) {
  const [open, setOpen] = useState(isOpen)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  // Calcular progreso total
  const totalProgress =
    progressData.length > 0 ? progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length : 0

  // Verificar si todos están completos
  const allComplete = progressData.every((item) => item.progress === 100)

  // Cerrar automáticamente cuando todos estén completos después de un retraso
  useEffect(() => {
    if (allComplete && isOpen) {
      const timer = setTimeout(() => {
        handleClose()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [allComplete, isOpen])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Obteniendo datos...</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Progress value={totalProgress} className="h-2 mb-4" />

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {progressData.map((item, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.username}</span>
                  <span className="text-sm text-gray-500">{Math.round(item.progress)}%</span>
                </div>
                <Progress value={item.progress} className="h-1 mb-2" />
                <p className="text-sm text-gray-600">
                  {item.status}
                  {item.editsFound && item.editsFound > 0 && (
                    <span className="ml-1 text-gray-500">({item.editsFound} ediciones)</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

