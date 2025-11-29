import type { DailySimulations, SimulationRecord } from "@/dtos/simulation"

const DAILY_LIMIT = 5

export function hasEmailAccess(): boolean {
  if (typeof window === "undefined") return false
  return Boolean(localStorage.getItem("userEmail"))
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userEmail")
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function getTodaySimulations(): SimulationRecord[] {
  if (typeof window === "undefined") return []

  const simulations: DailySimulations = JSON.parse(localStorage.getItem("simulations") || "{}")
  return simulations[getTodayString()] || []
}

export function hasReachedDailyLimit(email: string): boolean {
  return getTodaySimulations().filter((sim) => sim.email === email).length >= DAILY_LIMIT
}

export function getRemainingSimulations(email: string): number {
  const count = getTodaySimulations().filter((sim) => sim.email === email).length
  return Math.max(0, DAILY_LIMIT - count)
}

export function recordSimulation(email: string, creators: string[]): void {
  if (typeof window === "undefined") return

  const simulations: DailySimulations = JSON.parse(localStorage.getItem("simulations") || "{}")
  const today = getTodayString()

  if (!simulations[today]) {
    simulations[today] = []
  }

  simulations[today]!.push({
    email,
    creators,
    timestamp: new Date().toISOString(),
  })

  localStorage.setItem("simulations", JSON.stringify(simulations))
  cleanupOldSimulations(simulations)
}

function cleanupOldSimulations(simulations: DailySimulations): void {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoffDate = sevenDaysAgo.toISOString().split("T")[0]

  const cleaned: DailySimulations = {}
  Object.keys(simulations).forEach((date) => {
    if (date >= cutoffDate) {
      cleaned[date] = simulations[date]
    }
  })

  localStorage.setItem("simulations", JSON.stringify(cleaned))
}

