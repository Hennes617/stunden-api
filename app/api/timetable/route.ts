import { type NextRequest, NextResponse } from "next/server"

const USERNAME = process.env.NEXT_PUBLIC_USERNAME
const PASSWORD = process.env.NEXT_PUBLIC_PASSWORD
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
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
  date: string
  notice?: string
}

function parseXML(xmlText: string): Omit<TimetableData, "date" | "notice"> {
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
    const substitutionFlag = ifMatch ? ifMatch[1].trim() : ""
    const isSubstitution = substitutionFlag !== ""

    if (subject.toLowerCase().includes("spo") && !room) {
      room = "Sporthalle"
    }

    if (subject || teacher || room || isSubstitution) {
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
  }

  return { class: "07b", lessons }
}

const MAX_LOOKAHEAD_DAYS = 30

function toPlanFilename(date: Date) {
  return `PlanKl${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}.xml`
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function nextWeekday(date: Date) {
  const next = new Date(date)
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

function nextSchoolDay(date: Date) {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  return nextWeekday(next)
}

function resolveBaseDate(day: string) {
  const today = nextWeekday(new Date())
  if (day === "tomorrow") {
    return nextSchoolDay(today)
  }
  return today
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
    if (!BASE_URL) {
      return NextResponse.json({ error: "Base URL not configured" }, { status: 500 })
    }

    const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64")

    let targetDate = resolveBaseDate(day)

    for (let attempts = 0; attempts < MAX_LOOKAHEAD_DAYS; attempts++) {
      const url = `${BASE_URL}${toPlanFilename(targetDate)}`
      const response = await fetch(url, {
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
      })

      if (response.ok) {
        const xmlText = await response.text()
        const data = parseXML(xmlText)

        return NextResponse.json({
          ...data,
          date: toIsoDate(targetDate),
        })
      }

      if (response.status === 404) {
        targetDate = nextSchoolDay(targetDate)
        continue
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return NextResponse.json({
      class: "07b",
      lessons: [],
      date: toIsoDate(resolveBaseDate(day)),
      notice: "Ferien - kein Stundenplan verfügbar.",
    })
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ error: "Failed to fetch timetable data" }, { status: 500 })
  }
}
