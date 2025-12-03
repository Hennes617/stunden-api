"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimetableCard } from "./timetable-card"
import { TimetableSkeleton } from "./timetable-skeleton"
import type { TimetableData } from "@/lib/types"
import { Calendar, CalendarDays, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TimetableTabs() {
  const [todayData, setTodayData] = useState<TimetableData | null>(null)
  const [tomorrowData, setTomorrowData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [todayRes, tomorrowRes] = await Promise.all([
          fetch("/api/timetable?day=today", {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_TIMETABLE_API_KEY || "",
            },
          }),
          fetch("/api/timetable?day=tomorrow", {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_TIMETABLE_API_KEY || "",
            },
          }),
        ])

        if (!todayRes.ok || !tomorrowRes.ok) {
          throw new Error("Failed to fetch timetable data")
        }

        const today = await todayRes.json()
        const tomorrow = await tomorrowRes.json()

        setTodayData(today)
        setTomorrowData(tomorrow)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (daysOffset: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-base font-medium">
          Fehler beim Laden des Stundenplans: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Tabs defaultValue="today" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 h-12 p-1 bg-muted/50 border-2 border-border">
        <TabsTrigger
          value="today"
          className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <Calendar className="h-4 w-4" />
          Heute
        </TabsTrigger>
        <TabsTrigger
          value="tomorrow"
          className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
        >
          <CalendarDays className="h-4 w-4" />
          Morgen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="today" className="mt-0">
        {loading ? (
          <TimetableSkeleton />
        ) : todayData ? (
          <TimetableCard lessons={todayData.lessons} title="Stundenplan" date={formatDate(0)} />
        ) : null}
      </TabsContent>

      <TabsContent value="tomorrow" className="mt-0">
        {loading ? (
          <TimetableSkeleton />
        ) : tomorrowData ? (
          <TimetableCard lessons={tomorrowData.lessons} title="Stundenplan" date={formatDate(1)} />
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
