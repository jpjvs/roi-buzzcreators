export interface SimulationRecord {
  email: string
  creators: string[]
  timestamp: string
}

export type DailySimulations = Record<string, SimulationRecord[]>

