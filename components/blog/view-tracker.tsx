"use client"

import { useEffect } from "react"

export function ViewTracker() {
  useEffect(() => {
    fetch("/api/stats/view", { method: "POST" }).catch(() => {})
  }, [])

  return null
}
