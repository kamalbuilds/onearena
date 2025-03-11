import { SuiClient } from "@onelabs/sui/client"
import { Transaction } from "@onelabs/sui/transactions"
import { CONTRACT_CONFIG } from "./constants"
import type { Fighter, Battle, LeaderboardEntry } from "./types"

const client = new SuiClient({ url: CONTRACT_CONFIG.rpcUrl })

export async function mintFighter(
  account: string,
  name: string,
  stats: { attack: number; defense: number; speed: number; intelligence: number }
): Promise<string> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::mint_fighter`,
    arguments: [
      tx.pure.string(name),
      tx.pure.u32(stats.attack),
      tx.pure.u32(stats.defense),
      tx.pure.u32(stats.speed),
      tx.pure.u32(stats.intelligence),
    ],
  })

  return ""
}

export async function createBattle(
  account: string,
  fighter1Id: string,
  fighter2Id: string
): Promise<string> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::create_battle`,
    arguments: [tx.pure.string(fighter1Id), tx.pure.string(fighter2Id)],
  })

  return ""
}

export async function joinBattle(
  account: string,
  battleId: string,
  fighterId: string
): Promise<void> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::join_battle`,
    arguments: [tx.pure.string(battleId), tx.pure.string(fighterId)],
  })
}

export async function submitBattleMove(
  account: string,
  battleId: string,
  moveType: "attack" | "defend" | "special"
): Promise<void> {
  const tx = new Transaction()

  const moveIndex =
    moveType === "attack" ? 0 : moveType === "defend" ? 1 : 2

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::submit_move`,
    arguments: [
      tx.pure.string(battleId),
      tx.pure.u8(moveIndex),
    ],
  })
}

export async function resolveBattle(
  account: string,
  battleId: string
): Promise<string> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::resolve_battle`,
    arguments: [tx.pure.string(battleId)],
  })

  return ""
}

export async function getFighters(account: string): Promise<Fighter[]> {
  try {
    const objects = await client.getOwnedObjects({
      owner: account,
      filter: {
        StructType: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.moduleName}::Fighter`,
      },
    })

    return objects.data.map((obj) => ({
      id: obj.data?.objectId || "",
      name: "Fighter",
      owner: account,
      level: 1,
      experience: 0,
      stats: { attack: 0, defense: 0, speed: 0, intelligence: 0 },
      wins: 0,
      losses: 0,
      totalBattles: 0,
    }))
  } catch (error) {
    console.error("Error fetching fighters:", error)
    return []
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const result: LeaderboardEntry[] = []
    return result
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

export async function getBattle(battleId: string): Promise<Battle | null> {
  try {
    const obj = await client.getObject({
      id: battleId,
      options: { showContent: true },
    })

    if (obj.data) {
      return {
        id: battleId,
        fighter1Id: "",
        fighter2Id: "",
        fighter1: {} as Fighter,
        fighter2: {} as Fighter,
        status: "pending",
        createdAt: Date.now(),
        moves: [],
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching battle:", error)
    return null
  }
}

export async function getActiveBattles(account: string): Promise<Battle[]> {
  try {
    const result: Battle[] = []
    return result
  } catch (error) {
    console.error("Error fetching active battles:", error)
    return []
  }
}
