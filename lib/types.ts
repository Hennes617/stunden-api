export interface Lesson {
  period: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
  group?: string
  isSubstitution?: boolean
}

export interface TimetableData {
  class: string
  lessons: Lesson[]
}
