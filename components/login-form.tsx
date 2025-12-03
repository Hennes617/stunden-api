"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Lock } from "lucide-react"
import { Footer } from "@/components/login-footer"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // { changed code } API status for header badge
  const [status, setStatus] = useState<"unknown" | "up" | "down">("unknown")
  const mounted = useRef(true)
  const CHECK_INTERVAL = 30_000

  useEffect(() => {
    mounted.current = true
    const check = async () => {
      try {
        const res = await fetch("/api/timetable?day=today", {
          cache: "no-store",
          headers: { "x-api-key": process.env.NEXT_PUBLIC_TIMETABLE_API_KEY || "" },
        })
        if (!mounted.current) return
        setStatus(res.ok ? "up" : "down")
      } catch {
        if (!mounted.current) return
        setStatus("down")
      }
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [])

  const spanBase = "hidden sm:inline text-xs rounded-full px-2 py-1 transition-colors duration-300"
  const spanStateClasses =
    status === "up"
      ? "bg-green-50 text-green-700 animate-[pulse_2s_infinite]"
      : status === "down"
      ? "bg-red-50 text-red-700 animate-[pulse_2s_infinite]"
      : "bg-muted text-muted-foreground/90"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validUsername = process.env.NEXT_PUBLIC_LOGIN_USERNAME || ""
    const validPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD || ""

    if (username === validUsername && password === validPassword) {
      localStorage.setItem("isAuthenticated", "true")
      onLogin()
    } else {
      setError("Falscher Benutzername oder Passwort")
      setPassword("")
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl shadow-primary/10">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-lg shadow-primary/30">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Stundenplan</CardTitle>
              <CardDescription className="text-base">Klasse 07b - Anmeldung</CardDescription>

              {/* Status-Badge im Header */}
              <div className="flex items-center justify-center mt-2">
                <span
                  className={`${spanBase} ${spanStateClasses}`}
                  title={
                    status === "up"
                      ? "Partner-API erreichbar"
                      : status === "down"
                      ? "Partner-API derzeit nicht erreichbar"
                      : "Verbindungsstatus wird geprüft"
                  }
                >
                  API: {status === "up" ? "Online" : status === "down" ? "Offline" : "Wird geprüft"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Benutzername
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError("")
                  }}
                  placeholder="Username"
                  className="h-12 border-2 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="••••••••"
                  className="h-12 border-2 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                Anmelden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <footer className="w-full py-4 text-center text-sm text-muted-foreground">
              <div>© {new Date().getFullYear()} Stundenplan 7b. Alle Rechte vorbehalten.</div>
      </footer>
    </>
  )
}
