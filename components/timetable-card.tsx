"use client"

import { Card } from "@/components/ui/card"
import type { Lesson } from "@/lib/types"
import { Clock, User, MapPin, BookOpen } from "lucide-react"

interface TimetableCardProps {
  lessons: Lesson[]
  title: string
  date: string
}

export function TimetableCard({ lessons, title, date }: TimetableCardProps) {
  const lessonsByPeriod = lessons.reduce(
    (acc, lesson) => {
      if (!acc[lesson.period]) {
        acc[lesson.period] = []
      }
      acc[lesson.period].push(lesson)
      return acc
    },
    {} as Record<string, Lesson[]>,
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2 px-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm md:text-base text-muted-foreground font-medium">{date}</p>
      </div>

      <div className="grid gap-3">
        {Object.entries(lessonsByPeriod).map(([period, periodLessons]) => (
          <Card
            key={period}
            className="group overflow-hidden border-2 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex items-stretch">
              {/* Period indicator */}
              <div className="flex-shrink-0 w-20 md:w-24 bg-gradient-to-br from-primary/10 to-primary/5 border-r-2 border-border flex flex-col items-center justify-center p-4 group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-primary">{period}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1.5">
                  {periodLessons[0].startTime}
                </div>
              </div>

              {/* Lesson content */}
              <div className="flex-1 p-4 md:p-5 space-y-4">
                {periodLessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className={`${
                      periodLessons.length > 1 && idx < periodLessons.length - 1
                        ? "pb-4 border-b-2 border-dashed border-border"
                        : ""
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Subject and group */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <BookOpen
                            className={`h-5 w-5 ${lesson.isSubstitution ? "text-destructive" : "text-primary"}`}
                          />
                          <h3
                            className={`text-lg md:text-xl font-bold ${
                              lesson.isSubstitution ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {lesson.subject}
                          </h3>
                        </div>
                        {lesson.group && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                            {lesson.group}
                          </span>
                        )}
                        {lesson.isSubstitution && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive border border-destructive/30">
                            Vertretung
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div
                        className={`flex flex-wrap gap-x-5 gap-y-2 text-sm md:text-base ${
                          lesson.isSubstitution ? "text-destructive/90" : "text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4" />
                          <span>
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <User className="h-4 w-4" />
                          <span>{lesson.teacher}</span>
                        </div>
                        {lesson.room && (
                          <div className="flex items-center gap-2 font-medium">
                            <MapPin className="h-4 w-4" />
                            <span>{lesson.room}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
