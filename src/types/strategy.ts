export type MatchPhase = 'auto' | 'teleop' | 'endgame'

// Game Plan - groups strategies together for comparison
export interface GamePlan {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface GamePlanFormData {
  name: string
  description?: string
}

export interface Strategy {
  id: string
  gamePlanId: string  // Links to parent GamePlan
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
