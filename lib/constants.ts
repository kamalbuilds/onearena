export const CONTRACT_CONFIG = {
  packageId: "0x9a01a42b270ae9d1829f15334b5e74bc2e6c9ebbaa776b4186ca53880752ecf8",
  moduleName: "onearena",
  rpcUrl: "https://rpc-testnet.onelabs.cc:443",
}

export const STAT_CONSTRAINTS = {
  minStatPoints: 10,
  maxStatPoints: 100,
  totalPointsLimit: 300,
}

export const MOVE_TYPES = {
  ATTACK: "attack",
  DEFEND: "defend",
  SPECIAL: "special",
}

export const BATTLE_CONFIG = {
  minFighters: 2,
  maxFightersPerBattle: 2,
  battleTimeoutMs: 300000, // 5 minutes
}

export const MOCK_FIGHTERS: any[] = [
  {
    id: "1",
    name: "CyberNinja",
    owner: "0x123",
    level: 15,
    experience: 4500,
    stats: { attack: 90, defense: 70, speed: 95, intelligence: 75 },
    wins: 12,
    losses: 3,
    totalBattles: 15,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%2300f0ff' width='100' height='100'/%3E%3C/svg%3E",
  },
  {
    id: "2",
    name: "ShadowBlade",
    owner: "0x456",
    level: 12,
    experience: 3200,
    stats: { attack: 85, defense: 80, speed: 75, intelligence: 70 },
    wins: 8,
    losses: 4,
    totalBattles: 12,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%239d4edd' width='100' height='100'/%3E%3C/svg%3E",
  },
  {
    id: "3",
    name: "PhantomStrike",
    owner: "0x789",
    level: 18,
    experience: 6200,
    stats: { attack: 95, defense: 65, speed: 88, intelligence: 80 },
    wins: 16,
    losses: 2,
    totalBattles: 18,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%2339ff14' width='100' height='100'/%3E%3C/svg%3E",
  },
]
