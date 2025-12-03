import { type NextRequest, NextResponse } from "next/server"

const USERNAME = "schueler"
const PASSWORD = "SchuelerFGO"
const BASE_URL = "https://www.stundenplan24.de/20041773/mobil/mobdaten/"
const TIMETABLE_API_KEY = process.env.TIMETABLE_API_KEY

interface Lesson {
  period: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
  group?: string
  isSubstitution: boolean
}

interface TimetableData {
  class: string
  lessons: Lesson[]
}

function parseXML(xmlText: string): TimetableData {
  const klRegex = /<Kl>([\s\S]*?)<\/Kl>/g
  let klMatch
  let targetKlBlock = ""

  while ((klMatch = klRegex.exec(xmlText)) !== null) {
    const klBlock = klMatch[1]
    const classMatch = klBlock.match(/<Kurz>(.*?)<\/Kurz>/)
    const classCode = classMatch ? classMatch[1] : ""

    if (classCode === "07b") {
      targetKlBlock = klBlock
      break
    }
  }

  if (!targetKlBlock) {
    return { class: "07b", lessons: [] }
  }

  const lessons: Lesson[] = []
  const stdRegex = /<Std>([\s\S]*?)<\/Std>/g
  let stdMatch

  while ((stdMatch = stdRegex.exec(targetKlBlock)) !== null) {
    const stdBlock = stdMatch[1]

    const period = stdBlock.match(/<St>(.*?)<\/St>/)?.[1] || ""
    const startTime = stdBlock.match(/<Beginn>(.*?)<\/Beginn>/)?.[1] || ""
    const endTime = stdBlock.match(/<Ende>(.*?)<\/Ende>/)?.[1] || ""
    const subject = stdBlock.match(/<Fa>(.*?)<\/Fa>/)?.[1] || ""
    const teacher = stdBlock.match(/<Le>(.*?)<\/Le>/)?.[1] || ""
    let room = stdBlock.match(/<Ra>(.*?)<\/Ra>/)?.[1] || ""
    const group = stdBlock.match(/<Ku2>(.*?)<\/Ku2>/)?.[1] || undefined

    const ifMatch = stdBlock.match(/<If>(.*?)<\/If>/)
    const isSubstitution = ifMatch ? ifMatch[1].trim() !== "" : false

    if (subject.toLowerCase().includes("spo") && !room) {
      room = "Sporthalle"
    }

    lessons.push({
      period,
      startTime,
      endTime,
      subject,
      teacher,
      room,
      group,
      isSubstitution,
    })
  }

  return { class: "07b", lessons }
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("key")

  if (!apiKey || apiKey !== TIMETABLE_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing API key" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const day = searchParams.get("day") || "today"

  try {
    let url = BASE_URL

    if (day === "today") {
      const today = new Date()
      const filename = `PlanKl${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.xml`
      url += filename
    } else if (day === "tomorrow") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const filename = `PlanKl${tomorrow.getFullYear()}${String(tomorrow.getMonth() + 1).padStart(2, "0")}${String(tomorrow.getDate()).padStart(2, "0")}.xml`
      url += filename
    }

    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64")

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()
    const data = parseXML(xmlText)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ error: "Failed to fetch timetable data" }, { status: 500 })
  }
}
