"use client";
import React, { useEffect, useRef, useState } from "react";

export function Footer() {
  const [status, setStatus] = useState<"unknown" | "up" | "down">("unknown");
  const mounted = useRef(true);
  const CHECK_INTERVAL = 30_000; // 30s

  useEffect(() => {
    mounted.current = true;

    const check = async () => {
      try {
        const res = await fetch("/api/timetable?day=today", {
          cache: "no-store",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_TIMETABLE_API_KEY || "",
          },
        });
        if (!mounted.current) return;
        setStatus(res.ok ? "up" : "down");
      } catch {
        if (!mounted.current) return;
        setStatus("down");
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  const spanBase = "hidden sm:inline text-xs rounded-full px-2 py-1 transition-colors duration-300";
  const spanStateClasses =
    status === "up"
      ? "bg-green-50 text-green-700 animate-[pulse_2s_infinite]"
      : status === "down"
      ? "bg-red-50 text-red-700 animate-[pulse_2s_infinite]"
      : "bg-muted text-muted-foreground/90";

  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground">
      <div>© {new Date().getFullYear()} Stundenplan 7b. Alle Rechte vorbehalten.</div>
      <div className="mt-4 flex items-center justify-center gap-3">
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

        <a
          href="https://better-school.fallstein.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Better School Project (öffnet in neuem Tab)"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-primary/10 hover:text-primary transition-colors"
          title="Better School Project (öffnet in neuem Tab)"
        >
          {/* small school/book SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="opacity-90"
          >
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7l9-4 9 4v9a2 2 0 0 1-2 2h-2"
            />
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16v-5a1 1 0 0 0-1-1H7"
            />
          </svg>

          <span className="underline">Better School Project</span>

          {/* external link icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="opacity-70"
          >
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 3h7v7M10 14L21 3"
            />
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21H3V3"
            />
          </svg>
        </a>
        {/* screen-reader live region for status updates */}
        <span className="sr-only" aria-live="polite">
          {status === "up"
            ? "Partner-API erreichbar"
            : status === "down"
            ? "Partner-API nicht erreichbar"
            : "Partner-API-Status wird geprüft"}
        </span>
      </div>
    </footer>
  );
}