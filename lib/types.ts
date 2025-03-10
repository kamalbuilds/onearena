export interface Fighter {
  id: string
  name: string
  owner: string
  level: number
  experience: number
  stats: FighterStats
  wins: number
  losses: number
  totalBattles: number
  lastBattle?: number
  imageUrl?: string
}

export interface FighterStats {
  attack: number
  defense: number
  speed: number
  intelligence: number
}

export interface Battle {
  id: string
  fighter1Id: string
  fighter2Id: string
  fighter1: Fighter
  fighter2: Fighter
  winner?: string
  status: "pending" | "in_progress" | "completed"
  createdAt: number
  completedAt?: number
  moves: BattleMove[]
}

export interface BattleMove {
  fighterId: string
  moveType: "attack" | "defend" | "special"
  damage: number
  timestamp: number
}

export interface LeaderboardEntry {
  rank: number
  fighter: Fighter
  winRate: number
  totalBattles: number
}

export interface MintFormData {
  name: string
  attack: number
  defense: number
  speed: number
  intelligence: number
}
