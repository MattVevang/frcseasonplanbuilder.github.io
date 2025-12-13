export type MatchPhase = 'auto' | 'teleop' | 'endgame'

export interface Strategy {
  id: string
  rank: number
  phase: MatchPhase
  title: string
  description: string
  expectedPoints: number
  cycleTime?: number
  cyclesPerMatch?: number
  isDefensive: boolean
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface StrategyFormData {
  phase: MatchPhase
  title: string
  description: string
  expectedPoints: number
  cycleTime?: number
  cyclesPerMatch?: number
  isDefensive: boolean
  notes: string
}

export type StrategySortField = 'rank' | 'expectedPoints' | 'title' | 'phase'
