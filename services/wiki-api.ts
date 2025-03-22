/**
 * Servicio para interactuar con la API de MediaWiki
 */

// Interfaz para el progreso de la carga
export interface LoadingProgress {
  username: string
  status: string
  progress: number
  total?: number
  editsFound?: number
}

// Obtiene las contribuciones de un usuario en un período específico con paginación ilimitada
export async function getUserContributions(
  username: string,
  domain: string,
  startDate: string,
  endDate: string,
  onProgress?: (progress: LoadingProgress) => void,
) {
  try {
    // Convertir fechas para la API de MediaWiki (formato ISO 8601)
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    // La API de MediaWiki requiere formato ISO 8601 para timestamps
    const startTimestamp = startDateObj.toISOString().replace(/Z$/, "")
    const endTimestamp = new Date(endDateObj.getTime() + 86399999).toISOString().replace(/Z$/, "") // Fin del día

    let allContributions = []
    let continueParam = ""
    let fetchCount = 0

    // Notificar inicio
    if (onProgress) {
      onProgress({
        username,
        status: "Iniciando búsqueda de contribuciones...",
        progress: 0,
      })
    }

    // Obtener primero la información del usuario para saber cuántas ediciones totales tiene
    // Esto nos ayudará a mostrar un progreso más preciso
    let totalEditsEstimate = 0
    try {
      const userInfoUrl = `https://${domain}/w/api.php?action=query&list=users&ususers=${encodeURIComponent(
        username,
      )}&usprop=editcount&format=json&origin=*`

      const userInfoResponse = await fetch(userInfoUrl)
      const userInfoData = await userInfoResponse.json()

      if (userInfoData.query && userInfoData.query.users && userInfoData.query.users[0]) {
        totalEditsEstimate = userInfoData.query.users[0].editcount || 0
      }
    } catch (error) {
      console.warn("No se pudo obtener el recuento total de ediciones:", error)
    }

    do {
      // Construir URL de la API con paginación
      let apiUrl = `https://${domain}/w/api.php?action=query&list=usercontribs&ucuser=${encodeURIComponent(
        username,
      )}&ucstart=${endTimestamp}&ucend=${startTimestamp}&uclimit=500&ucprop=title|timestamp|comment|size|ids&format=json&origin=*`

      // Agregar parámetro de continuación si existe
      if (continueParam) {
        apiUrl += `&uccontinue=${continueParam}`
      }

      // Notificar progreso
      if (onProgress) {
        const progressMessage = `Obteniendo contribuciones (página ${fetchCount + 1})...`
        let progressPercentage = 0

        if (totalEditsEstimate > 0 && allContributions.length < totalEditsEstimate) {
          // Si tenemos una estimación, usarla para el porcentaje
          progressPercentage = Math.min(90, (allContributions.length / totalEditsEstimate) * 100)
        } else {
          // Si no tenemos estimación o ya superamos la estimación, usar un enfoque diferente
          progressPercentage = continueParam ? Math.min(90, (fetchCount / (fetchCount + 2)) * 100) : 95
        }

        onProgress({
          username,
          status: progressMessage,
          progress: progressPercentage,
          editsFound: allContributions.length,
        })
      }

      console.log(`MediaWiki API URL (page ${fetchCount + 1}): ${apiUrl}`)
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`MediaWiki API responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.query || !data.query.usercontribs) {
        break
      }

      // Agregar contribuciones a la lista
      allContributions = [...allContributions, ...data.query.usercontribs]

      // Verificar si hay más páginas
      continueParam = data.continue ? data.continue.uccontinue : ""
      fetchCount++

      // Notificar progreso actualizado
      if (onProgress) {
        onProgress({
          username,
          status: `Obtenidas ${allContributions.length} contribuciones...`,
          progress: continueParam
            ? Math.min(
                95,
                (allContributions.length / Math.max(totalEditsEstimate, allContributions.length + 500)) * 100,
              )
            : 100,
          editsFound: allContributions.length,
        })
      }

      // Pequeña pausa para evitar sobrecargar la API
      if (continueParam) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } while (continueParam)

    // Notificar finalización
    if (onProgress) {
      onProgress({
        username,
        status: `Completado. ${allContributions.length} contribuciones encontradas.`,
        progress: 100,
        editsFound: allContributions.length,
      })
    }

    return {
      contributions: allContributions,
      editCount: allContributions.length,
      hasMoreEdits: false, // Ya no hay más ediciones porque obtenemos todas
    }
  } catch (error) {
    console.error(`Error fetching contributions for ${username}:`, error)

    // Notificar error
    if (onProgress) {
      onProgress({
        username,
        status: `Error: ${error.message}`,
        progress: 100,
      })
    }

    return { contributions: [], editCount: 0, hasMoreEdits: false }
  }
}

// Obtiene información básica del usuario
export async function getUserInfo(username: string, domain: string, onProgress?: (progress: LoadingProgress) => void) {
  try {
    if (onProgress) {
      onProgress({
        username,
        status: "Obteniendo información del usuario...",
        progress: 50,
      })
    }

    const apiUrl = `https://${domain}/w/api.php?action=query&list=users&ususers=${encodeURIComponent(
      username,
    )}&usprop=registration|editcount|groups&format=json&origin=*`

    console.log(`MediaWiki User Info API URL: ${apiUrl}`)
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`MediaWiki API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.query || !data.query.users || !data.query.users[0]) {
      if (onProgress) {
        onProgress({
          username,
          status: "No se encontró información del usuario",
          progress: 100,
        })
      }
      return { registration: "Unknown", editcount: 0, groups: [] }
    }

    if (onProgress) {
      onProgress({
        username,
        status: "Información del usuario obtenida",
        progress: 100,
      })
    }

    return data.query.users[0]
  } catch (error) {
    console.error(`Error fetching user info for ${username}:`, error)

    if (onProgress) {
      onProgress({
        username,
        status: `Error: ${error.message}`,
        progress: 100,
      })
    }

    return { registration: "Unknown", editcount: 0, groups: [] }
  }
}

// Obtiene la distribución de ediciones por espacio de nombres (opcional)
export async function getNamespaceEdits(
  username: string,
  domain: string,
  onProgress?: (progress: LoadingProgress) => void,
  skipNamespaces = false,
) {
  // Si se indica saltar los espacios de nombres, devolver objeto vacío
  if (skipNamespaces) {
    if (onProgress) {
      onProgress({
        username,
        status: "Espacios de nombres omitidos",
        progress: 100,
      })
    }
    return {}
  }

  try {
    if (onProgress) {
      onProgress({
        username,
        status: "Analizando distribución por espacios de nombres...",
        progress: 50,
      })
    }

    // Usamos la API de MediaWiki para obtener ediciones por espacio de nombres
    const apiUrl = `https://${domain}/w/api.php?action=query&list=usercontribs&ucuser=${encodeURIComponent(
      username,
    )}&uclimit=500&ucprop=title|ns&format=json&origin=*`

    console.log(`MediaWiki Namespace API URL: ${apiUrl}`)
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`MediaWiki API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.query || !data.query.usercontribs) {
      if (onProgress) {
        onProgress({
          username,
          status: "No se encontraron datos de espacios de nombres",
          progress: 100,
        })
      }
      return {}
    }

    // Agrupar contribuciones por espacio de nombres
    const namespaceTotals = {}
    data.query.usercontribs.forEach((contrib) => {
      const ns = contrib.ns.toString()
      if (!namespaceTotals[ns]) {
        namespaceTotals[ns] = 0
      }
      namespaceTotals[ns]++
    })

    if (onProgress) {
      onProgress({
        username,
        status: "Distribución por espacios de nombres completada",
        progress: 100,
      })
    }

    return namespaceTotals
  } catch (error) {
    console.error(`Error fetching namespace data for ${username}:`, error)

    if (onProgress) {
      onProgress({
        username,
        status: `Error: ${error.message}`,
        progress: 100,
      })
    }

    return {}
  }
}

// Obtiene las contribuciones diarias para un período específico
export async function getDailyContributions(
  contributions: any[],
  onProgress?: (progress: LoadingProgress) => void,
  username?: string,
) {
  try {
    if (onProgress && username) {
      onProgress({
        username,
        status: "Procesando contribuciones diarias...",
        progress: 50,
      })
    }

    // Agrupar contribuciones por fecha
    const contributionsByDate = {}
    contributions.forEach((contrib) => {
      const date = contrib.timestamp.split("T")[0]
      if (!contributionsByDate[date]) {
        contributionsByDate[date] = 0
      }
      contributionsByDate[date]++
    })

    // Convertir a formato de array para gráficos
    const dailyEdits = Object.entries(contributionsByDate).map(([date, count]) => ({
      date,
      count,
    }))

    // Ordenar por fecha
    dailyEdits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (onProgress && username) {
      onProgress({
        username,
        status: "Procesamiento de contribuciones diarias completado",
        progress: 100,
      })
    }

    return dailyEdits
  } catch (error) {
    console.error(`Error processing daily contributions:`, error)

    if (onProgress && username) {
      onProgress({
        username,
        status: `Error: ${error.message}`,
        progress: 100,
      })
    }

    return []
  }
}

// Función para buscar usuarios por prefijo
export async function searchUsersByPrefix(prefix: string, domain: string): Promise<string[]> {
  try {
    if (!prefix || prefix.length < 2) {
      return []
    }

    // Usar el endpoint allusers con el parámetro auprefix
    const apiUrl = `https://${domain}/w/api.php?action=query&list=allusers&auprefix=${encodeURIComponent(
      prefix,
    )}&aulimit=10&format=json&origin=*`

    console.log(`MediaWiki User Search API URL: ${apiUrl}`)
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`MediaWiki API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API response:", data)

    // Verificar si hay errores en la respuesta
    if (data.error) {
      console.error("API Error:", data.error)
      return []
    }

    // Verificar la estructura correcta de la respuesta
    if (!data.query || !data.query.allusers) {
      console.log("No users found or invalid response format:", data)
      return []
    }

    // Extraer los nombres de usuario
    const usernames = data.query.allusers.map((user) => user.name)
    console.log(`Found ${usernames.length} users matching "${prefix}":`, usernames)

    return usernames
  } catch (error) {
    console.error(`Error searching users: ${error}`)
    return []
  }
}

