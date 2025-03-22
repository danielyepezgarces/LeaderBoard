"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Check, Copy, Link, QrCode, Share2, Twitter, Facebook, Linkedin } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  title?: string
}

export function ShareDialog({ isOpen, onClose, shareUrl, title = "Wiki Leaderboard" }: ShareDialogProps) {
  const { msg } = useI18n()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopyLink = () => {
    if (inputRef.current) {
      inputRef.current.select()
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)

      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "Revisa estos resultados de Wiki Leaderboard",
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error al compartir:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const shareOnTwitter = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`Revisa estos resultados de Wiki Leaderboard: ${title}`)
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank")
    }
  }

  const shareOnFacebook = () => {
    if (typeof window !== "undefined") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
    }
  }

  const shareOnLinkedIn = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`Revisa estos resultados de Wiki Leaderboard: ${title}`)
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${text}`,
        "_blank",
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{msg("share.title")}</DialogTitle>
          <DialogDescription>{msg("share.description")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="link">
              <Link className="h-4 w-4 mr-2" />
              {msg("share.link")}
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              {msg("share.qrcode")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="flex space-x-2">
              <Input ref={inputRef} value={shareUrl} readOnly className="flex-1" />
              <Button size="icon" onClick={handleCopyLink} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground mb-2">{msg("share.social")}</p>
              <div className="flex space-x-2">
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  {msg("share.native")}
                </Button>
                <Button onClick={shareOnTwitter} variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button onClick={shareOnFacebook} variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button onClick={shareOnLinkedIn} variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
            <p className="text-sm text-center text-muted-foreground">{msg("share.qrcode.description")}</p>
            <Button onClick={handleCopyLink} variant="outline" className="w-full">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {msg("share.copy")}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

