"use client"

import { useState, useEffect } from "react"
import { TimetableTabs } from "@/components/timetable-tabs"
import { LoginForm } from "@/components/login-form"
import { GraduationCap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    setIsAuthenticated(authStatus === "true")
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Stundenplan</h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium">Klasse 07b</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </Button>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full" />
        </header>

        <TimetableTabs />
      </div>
      <Footer/>
    </main>
  )
}
