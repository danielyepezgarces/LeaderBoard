"use client"

import { useState, useRef, useEffect } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { useI18n } from "@/components/i18n-provider"
import { Footer } from "@/components/footer"
import { LanguageBar } from "@/components/language-bar"
import { Header } from "@/components/header"
import { SearchForm } from "@/components/search-form"
import { ResultsCard } from "@/components/results-card"
import { ChartCard } from "@/components/chart-card"
import { LoadingProgressDialog } from "@/components/loading-progress-dialog"

// Importar el servicio de API
import {
  getUserContributions,
  getUserInfo,
  getNamespaceEdits,
  getDailyContributions,
  type LoadingProgress,
} from "@/services/wiki-api"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function WikiLeaderboard() {
  // Get i18n context
  const { msg } = useI18n()

  // State variables
  const [project, setProject] = useState("wikipedia")
  const [language, setLanguage] = useState("fr")
  const [theUrl, setTheUrl] = useState("")
  const [usernames, setUsernames] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultWikipedia, setResultWikipedia] = useState([])
  const [resultCount, setResultCount] = useState(-1)
  const [inputValue, setInputValue] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const inputRef = useRef(null)
  const [userContribs, setUserContribs] = useState([])
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [newUrl, setNewUrl] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [detailedUserData, setDetailedUserData] = useState([])
  const [chartType, setChartType] = useState("line")

  // Estado para el diálogo de progreso
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [progressData, setProgressData] = useState<LoadingProgress[]>([])

  // Estado para opciones avanzadas
  const [skipNamespaces, setSkipNamespaces] = useState(true)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 30)
  const today = new Date()
  today.setDate(today.getDate())

  const [startDate, setStartDate] = useState(yesterday.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0])

  // Wikimedia projects
  const wikimediaProjects = [
    { id: "wikipedia", name: "Wikipedia" },
    { id: "wiktionary", name: "Wiktionary" },
    { id: "wikiquote", name: "Wikiquote" },
    { id: "wikibooks", name: "Wikibooks" },
    { id: "wikisource", name: "Wikisource" },
    { id: "wikinews", name: "Wikinews" },
    { id: "wikiversity", name: "Wikiversity" },
    { id: "wikivoyage", name: "Wikivoyage" },
    { id: "wikidata", name: "Wikidata" },
    { id: "commons", name: "Commons" },
    { id: "meta", name: "Meta-Wiki" },
    { id: "mediawiki", name: "MediaWiki" },
    { id: "species", name: "Wikispecies" },
  ]

  // Languages for Wikimedia projects
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
    { code: "ar", name: "العربية" },
    // ... otros idiomas
  ]

  // Helper function to get the domain for the selected project and language
  const getDomain = (proj, lang) => {
    if (proj === "commons") return "commons.wikimedia.org"
    if (proj === "meta") return "meta.wikimedia.org"
    if (proj === "species") return "species.wikimedia.org"
    if (proj === "mediawiki") return "www.mediawiki.org"
    if (proj === "wikidata") return "www.wikidata.org"
    return `${lang}.${proj}.org`
  }

  useEffect(() => {
    // Solo ejecutar código relacionado con window en el cliente
    if (typeof window !== "undefined") {
      setTheUrl(window.location.origin + window.location.pathname)

      const fetchFeaturedImages = async () => {
        try {
          const response = await fetch(
            "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:Featured_pictures_on_Wikimedia_Commons&gcmtype=file&gcmlimit=10&prop=imageinfo&iiprop=url|thumbnail&iiurlwidth=1366&format=json&origin=*",
          )
          const data = await response.json()
          const pages = data.query.pages
          const images = Object.keys(pages).map((key) => pages[key].imageinfo[0].thumburl)
          const randomImage = images[Math.floor(Math.random() * images.length)]
          setFeaturedImage(randomImage)
        } catch (error) {
          console.error("Error fetching the featured images:", error)
          // Fallback image
          setFeaturedImage("/placeholder.svg?height=1200&width=1920")
        }
      }

      fetchFeaturedImages()
    }
  }, [])

  // Función para actualizar el progreso de un usuario específico
  const updateProgress = (progress: LoadingProgress) => {
    setProgressData((prevData) => {
      const newData = [...prevData]
      const index = newData.findIndex((item) => item.username === progress.username)

      if (index !== -1) {
        newData[index] = progress
      } else {
        newData.push(progress)
      }

      return newData
    })
  }

  // Reemplazar la función makeTheSearch con esta versión actualizada
  async function makeTheSearch(usernames, startDate, endDate) {
    setLoading(true)
    setProgressData([])
    setShowProgressDialog(true)

    let usernameArray = ""
    if (inputRef?.current?.value) {
      usernameArray = inputRef.current.value.split(",").map((name) => name.trim())
    } else {
      usernameArray = usernames.split(",").map((name) => name.trim())
    }

    try {
      console.log(`Starting search for users: ${usernameArray.join(", ")}`)
      console.log(`Project: ${project}, Language: ${language}`)
      console.log(`Date range: ${startDate} to ${endDate}`)

      // Obtener el dominio para el proyecto y lenguaje seleccionados
      const domain = getDomain(project, language)

      // Obtener datos para cada usuario usando la API de MediaWiki
      const contributionsByUser = await Promise.all(
        usernameArray.map(async (username) => {
          try {
            // Obtener contribuciones del usuario con seguimiento de progreso
            const contributionsData = await getUserContributions(username, domain, startDate, endDate, updateProgress)

            // Obtener información del usuario con seguimiento de progreso
            const userInfoData = await getUserInfo(username, domain, updateProgress)

            // Obtener distribución por espacio de nombres (opcional)
            const namespaceTotals = await getNamespaceEdits(username, domain, updateProgress, skipNamespaces)

            // Obtener contribuciones diarias para gráficos
            const dailyEdits = await getDailyContributions(contributionsData.contributions, updateProgress, username)

            // Calcular porcentaje de resúmenes de edición
            const editsWithSummary = contributionsData.contributions.filter(
              (contrib) => contrib.comment && contrib.comment.trim() !== "",
            ).length

            const editSummaryPercentage =
              contributionsData.editCount > 0 ? Math.round((editsWithSummary / contributionsData.editCount) * 100) : 0

            return {
              username,
              editCount: contributionsData.editCount,
              userInfo: userInfoData,
              topEdits: contributionsData.contributions.slice(0, 5),
              dailyEdits: dailyEdits,
              registrationDate: userInfoData.registration || "Unknown",
              editSummaryPercentage: editSummaryPercentage,
              namespaceTotals: namespaceTotals,
              hasMoreEdits: false,
            }
          } catch (error) {
            console.error(`Error processing data for user ${username}:`, error)

            // Actualizar progreso con error
            updateProgress({
              username,
              status: `Error: ${error.message}`,
              progress: 100,
            })

            // Devolver datos mínimos para este usuario para evitar romper todo el proceso
            return {
              username,
              editCount: 0,
              userInfo: {},
              topEdits: [],
              dailyEdits: [],
              registrationDate: "Unknown",
              editSummaryPercentage: 0,
              namespaceTotals: {},
              hasMoreEdits: false,
            }
          }
        }),
      )

      // Procesar los datos para mostrar
      const contributionsCountByUser = contributionsByUser.map((user) => ({
        username: user.username,
        count: user.editCount,
        registrationDate: user.registrationDate,
        editSummaryPercentage: user.editSummaryPercentage,
        namespaceTotals: user.namespaceTotals,
        hasMoreEdits: user.hasMoreEdits,
      }))

      setUserContribs(contributionsCountByUser)
      const sortedUsers = contributionsCountByUser.sort((a, b) => b.count - a.count)

      setResultWikipedia(sortedUsers)
      setResultCount(sortedUsers.reduce((sum, user) => sum + user.count, 0))

      // Preparar datos para el gráfico
      const allDates = new Set()
      contributionsByUser.forEach((user) => {
        user.dailyEdits.forEach((edit) => {
          allDates.add(edit.date)
        })
      })

      const sortedDates = Array.from(allDates).sort()

      const datasets = contributionsByUser.map((user, index) => {
        const data = sortedDates.map((date) => {
          const editForDate = user.dailyEdits.find((edit) => edit.date === date)
          return editForDate ? editForDate.count : 0
        })

        return {
          label: user.username,
          data: data,
          borderColor: getRandomColor(index),
          backgroundColor: getRandomColor(index, 0.2),
          tension: 0.4,
        }
      })

      setChartData({
        labels: sortedDates.map((date) => formatDateForDisplay(date)),
        datasets: datasets,
      })

      // Establecer URL para compartir
      if (typeof window !== "undefined") {
        let params = `${usernames}_${startDate}_${endDate}`
        params = params.replaceAll(",", "**")
        params = params.replaceAll(" ", "")

        setNewUrl(theUrl + params)
      }

      // Almacenar los datos detallados para visualizaciones adicionales
      setDetailedUserData(contributionsByUser)
    } catch (error) {
      console.error("Error fetching data from MediaWiki API:", error)
      // Mostrar mensaje de error al usuario
      setResultWikipedia([])
      setResultCount(0)
    } finally {
      setLoading(false)
      // El diálogo de progreso se cerrará automáticamente cuando todos los usuarios estén al 100%
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    makeTheSearch(usernames, startDate, endDate)
  }

  const handleLanguageChange = (value) => {
    setLanguage(value)
  }

  const handleProjectChange = (value) => {
    setProject(value)
  }

  const getRandomColor = (index, alpha = 1) => {
    const colors = [
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
    ]
    return colors[index % colors.length]
  }

  const handleShareLink = () => {
    if (typeof window === "undefined") return

    const url = new URL(window.location.href)
    url.searchParams.set("usernames", usernames)
    url.searchParams.set("startDate", startDate)
    url.searchParams.set("endDate", endDate)
    url.searchParams.set("lang", language)
    url.searchParams.set("project", project)

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err)
      })
  }

  const exportToJSON = () => {
    if (typeof window === "undefined") return

    const data = {
      resultWikipedia,
      userContribs,
      detailedData: detailedUserData,
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
    const link = document.createElement("a")
    link.href = jsonString
    link.download = "wiki_leaderboard_data.json"
    link.click()
  }

  const exportToCSV = () => {
    if (typeof window === "undefined") return

    const csvRows = [["Username", "Contributions"], ...userContribs.map((user) => [user.username, user.count])]

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "wiki_leaderboard_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    // Solo ejecutar código relacionado con window en el cliente
    if (typeof window !== "undefined") {
      if (inputRef.current) {
        setInputValue(inputRef.current.value)
      }

      // Check URL for parameters
      const url = new URL(window.location.href)
      const urlUsernames = url.searchParams.get("usernames")
      const urlStartDate = url.searchParams.get("startDate")
      const urlEndDate = url.searchParams.get("endDate")
      const urlLang = url.searchParams.get("lang") || url.searchParams.get("language")
      const urlProject = url.searchParams.get("project")

      if (urlUsernames && urlStartDate && urlEndDate) {
        setUsernames(urlUsernames)
        setStartDate(urlStartDate)
        setEndDate(urlEndDate)
        if (urlLang) setLanguage(urlLang)
        if (urlProject) setProject(urlProject)
        makeTheSearch(urlUsernames, urlStartDate, urlEndDate)
      }
    }
  }, [])

  function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  }

  function dateFormat(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Obtener el dominio actual para el autocompletado
  const currentDomain = getDomain(project, language)

  return (
    <main className="min-h-screen bg-background">
      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: featuredImage ? `url(${featuredImage})` : "none" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Barra superior para el selector de idioma */}
        <LanguageBar />

        <div className="relative container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <Header
            project={project}
            language={language}
            onProjectChange={handleProjectChange}
            onLanguageChange={handleLanguageChange}
            getDomain={getDomain}
            wikimediaProjects={wikimediaProjects}
            languages={languages}
          />

          {/* Form */}
          <SearchForm
            usernames={usernames}
            startDate={startDate}
            endDate={endDate}
            inputValue={inputValue}
            inputRef={inputRef}
            onUsernamesChange={setUsernames}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSubmit={handleSubmit}
            skipNamespaces={skipNamespaces}
            onSkipNamespacesChange={setSkipNamespaces}
            domain={currentDomain}
          />

          {/* Results and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results */}
            <ResultsCard
              loading={loading}
              resultCount={resultCount}
              resultWikipedia={resultWikipedia}
              usernames={usernames}
              startDate={startDate}
              endDate={endDate}
              detailedUserData={detailedUserData}
              onShareLink={handleShareLink}
              onExportCSV={exportToCSV}
              onExportJSON={exportToJSON}
              dateFormat={dateFormat}
              project={project}
              language={language}
            />

            {/* Chart */}
            <ChartCard
              chartData={chartData}
              chartType={chartType}
              setChartType={setChartType}
              detailedUserData={detailedUserData}
            />
          </div>
        </div>
      </div>

      {/* Diálogo de progreso */}
      <LoadingProgressDialog
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        progressData={progressData}
      />

      <Footer />
    </main>
  )
}

