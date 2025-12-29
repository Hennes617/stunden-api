import { type NextRequest, NextResponse } from "next/server"

const TIMETABLE_API_KEY = process.env.TIMETABLE_API_KEY

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/timetable?day=today`, {
      headers: {
        "x-api-key": TIMETABLE_API_KEY || "",
      },
      cache: "no-store",
    })

    if (response.ok) {
      return NextResponse.json(
        {
          code: 200,
          status: "online",
          message: "Timetable API is reachable",
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          code: 503,
          status: "offline",
          message: "Timetable API returned an error",
        },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        code: 503,
        status: "offline",
        message: "Timetable API is unreachable",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    )
  }
  
}
