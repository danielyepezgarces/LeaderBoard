import { Book, Code, Bug, MessageSquare, Users, Copyright } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function Footer() {
  const { msg } = useI18n()

  return (
    <footer className="bg-gray-900 text-gray-400 py-4">
      <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-6">
          <a
            href="https://github.com/danielyepezgarces/WikiLeaderBoard/blob/README.md"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Book className="h-4 w-4" />
            <span>{msg("footer.documentation")}</span>
          </a>
          <a
            href="https://github.com/danielyepezgarces/WikiLeaderBoard.git"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Code className="h-4 w-4" />
            <span>{msg("footer.viewSource")}</span>
          </a>
          <a
            href="https://github.com/danielyepezgarces/WikiLeaderBoard/issues"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Bug className="h-4 w-4" />
            <span>{msg("footer.reportIssue")}</span>
          </a>
        </div>

        <div className="flex flex-wrap gap-6">
          <a
            href="https://github.com/danielyepezgarces/WikiLeaderBoard/issues"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{msg("footer.feedback")}</span>
          </a>
          <a
            href="https://meta.wikimedia.org/wiki/User:Danielyepezgarces"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>{msg("footer.developedBy")}</span>
          </a>
          <a
            href="https://meta.wikimedia.org/wiki/User:Danielyepezgarces"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Copyright className="h-4 w-4" />
            <span>{msg("footer.copyright")}</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

