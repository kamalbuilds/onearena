"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrentAccount } from "@onelabs/dapp-kit"
import { MOCK_FIGHTERS } from "@/lib/constants"
import BattleArena from "@/components/battle/battle-arena"
import FighterCard from "@/components/fighter/fighter-card"
import { AlertCircle, Plus, Users } from "lucide-react"
import { LightningIcon, CrossedSwordsIcon, TrophyIcon, BrainIcon } from "@/components/ui/game-icons"
import FighterAvatar from "@/components/ui/fighter-avatar"
import { toast } from "sonner"
import type { Fighter } from "@/lib/types"

type BattleTab = "available" | "create"

interface BattleRound {
  round: number
  fighter1Move: number
  fighter2Move: number
  fighter1Damage: number
  fighter2Damage: number
  fighter1Hp: number
  fighter2Hp: number
  narration: string
  critical: boolean
}

interface BattleResult {
  winnerId: string
  winnerName: string
  loserId: string
  loserName: string
  rounds: BattleRound[]
  totalRounds: number
  finalNarration: string
  fighter1FinalHp: number
  fighter2FinalHp: number
  xpReward: number
  dominanceScore: number
}

export default function BattlePage() {
  const account = useCurrentAccount()
  const [activeTab, setActiveTab] = useState<BattleTab>("create")
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null)
  const [opponentFighter, setOpponentFighter] = useState<string | null>(null)

  // Battle state
  const [battleActive, setBattleActive] = useState(false)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState<BattleRound | null>(null)
  const [narrationLog, setNarrationLog] = useState<string[]>([])
  const [isAttacking, setIsAttacking] = useState<"fighter1" | "fighter2" | null>(null)
  const [f1Hp, setF1Hp] = useState(0)
  const [f2Hp, setF2Hp] = useState(0)
  const [f1MaxHp, setF1MaxHp] = useState(0)
  const [f2MaxHp, setF2MaxHp] = useState(0)
  const [strategyText, setStrategyText] = useState("")
  const [battleComplete, setBattleComplete] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const availableFighters = useMemo(() => MOCK_FIGHTERS as Fighter[], [])

  const selectedFighterData = availableFighters.find((f) => f.id === selectedFighter)
  const opponentFighterData = availableFighters.find((f) => f.id === opponentFighter)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const simulateBattle = useCallback(async () => {
    if (!selectedFighterData || !opponentFighterData) return

    try {
      const response = await fetch("/api/battle/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fighter1: {
            id: selectedFighterData.id,
            name: selectedFighterData.name,
            attack: selectedFighterData.stats.attack,
            defense: selectedFighterData.stats.defense,
            speed: selectedFighterData.stats.speed,
            intelligence: selectedFighterData.stats.intelligence,
            hp: Math.round(selectedFighterData.stats.defense * 1.5 + 100),
            level: selectedFighterData.level,
          },
          fighter2: {
            id: opponentFighterData.id,
            name: opponentFighterData.name,
            attack: opponentFighterData.stats.attack,
            defense: opponentFighterData.stats.defense,
            speed: opponentFighterData.stats.speed,
            intelligence: opponentFighterData.stats.intelligence,
            hp: Math.round(opponentFighterData.stats.defense * 1.5 + 100),
            level: opponentFighterData.level,
          },
        }),
      })

      if (!response.ok) throw new Error("Simulation failed")
      const result: BattleResult = await response.json()
      return result
    } catch (error) {
      console.error("Battle simulation error:", error)
      return null
    }
  }, [selectedFighterData, opponentFighterData])

  const playRound = useCallback((result: BattleResult, roundIdx: number) => {
    if (roundIdx >= result.rounds.length) {
      // Battle complete
      setBattleComplete(true)
      setBattleActive(false)
      setNarrationLog((prev) => [...prev, "", `🏆 ${result.finalNarration}`])
      toast.success(`${result.winnerName} wins! +${result.xpReward} XP`)
      return
    }

    const round = result.rounds[roundIdx]
    setCurrentRound(round)
    setCurrentRoundIndex(roundIdx)

    // Animate attack sequence
    const f1First = round.fighter1Damage >= round.fighter2Damage
    setIsAttacking(f1First ? "fighter1" : "fighter2")

    setTimeout(() => {
      setIsAttacking(f1First ? "fighter2" : "fighter1")
    }, 400)

    setTimeout(() => {
      setIsAttacking(null)
      setF1Hp(round.fighter1Hp)
      setF2Hp(round.fighter2Hp)
      setNarrationLog((prev) => [...prev, round.narration])

      // Next round
      timerRef.current = setTimeout(() => playRound(result, roundIdx + 1), 1500)
    }, 800)
  }, [])

  const handleStartBattle = useCallback(async () => {
    if (!selectedFighter || !opponentFighter) {
      toast.error("Select both fighters")
      return
    }
    if (selectedFighter === opponentFighter) {
      toast.error("Cannot battle the same fighter")
      return
    }

    // Reset state
    setBattleActive(true)
    setBattleComplete(false)
    setBattleResult(null)
    setCurrentRound(null)
    setCurrentRoundIndex(0)
    setNarrationLog(["⚔️ Battle starting..."])
    setIsAttacking(null)
    setStrategyText("")

    const maxF1Hp = Math.round((selectedFighterData?.stats.defense || 50) * 1.5 + 100)
    const maxF2Hp = Math.round((opponentFighterData?.stats.defense || 50) * 1.5 + 100)
    setF1MaxHp(maxF1Hp)
    setF2MaxHp(maxF2Hp)
    setF1Hp(maxF1Hp)
    setF2Hp(maxF2Hp)

    // Fetch AI strategy
    try {
      const stratRes = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myFighter: {
            id: selectedFighterData?.id,
            name: selectedFighterData?.name,
            attack: selectedFighterData?.stats.attack,
            defense: selectedFighterData?.stats.defense,
            speed: selectedFighterData?.stats.speed,
            intelligence: selectedFighterData?.stats.intelligence,
            hp: maxF1Hp,
          },
          opponentFighter: {
            id: opponentFighterData?.id,
            name: opponentFighterData?.name,
            attack: opponentFighterData?.stats.attack,
            defense: opponentFighterData?.stats.defense,
            speed: opponentFighterData?.stats.speed,
            intelligence: opponentFighterData?.stats.intelligence,
            hp: maxF2Hp,
          },
        }),
      })
      if (stratRes.ok) {
        const strat = await stratRes.json()
        setStrategyText(`AI Strategy: ${strat.reasoning} (Win probability: ${Math.round(strat.winProbability * 100)}%)`)
        setNarrationLog((prev) => [...prev, `🧠 ${strat.reasoning}`])
      }
    } catch {
      // Strategy fetch is optional
    }

    // Simulate battle
    const result = await simulateBattle()
    if (!result) {
      toast.error("Battle simulation failed")
      setBattleActive(false)
      return
    }

    setBattleResult(result)
    setNarrationLog((prev) => [...prev, "", "⚡ Round 1 begins!"])

    // Start animated playback
    timerRef.current = setTimeout(() => playRound(result, 0), 1000)
  }, [selectedFighter, opponentFighter, selectedFighterData, opponentFighterData, simulateBattle, playRound])

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setBattleActive(false)
    setBattleComplete(false)
    setBattleResult(null)
    setCurrentRound(null)
    setNarrationLog([])
    setSelectedFighter(null)
    setOpponentFighter(null)
    setStrategyText("")
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="heading-glow text-5xl md:text-6xl mb-4">Battle Arena</h1>
        <p className="text-xl text-gray-400">
          AI-powered strategic combat on OneChain
        </p>
      </motion.div>

      {!account && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-lg border-2 border-yellow-600 bg-yellow-600/10 flex gap-4"
        >
          <AlertCircle className="text-yellow-400 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">Wallet Required</h3>
            <p className="text-sm text-yellow-300">
              Connect your wallet to battle on OneChain
            </p>
          </div>
        </motion.div>
      )}

      {/* Battle in progress or complete */}
      {(battleActive || battleComplete) && selectedFighterData && opponentFighterData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Strategy Display */}
          {strategyText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glow-border p-4 flex items-start gap-3"
            >
              <BrainIcon size={20} className="text-purple-400 flex-shrink-0 mt-0.5" glow />
              <p className="text-sm text-purple-300">{strategyText}</p>
            </motion.div>
          )}

          <BattleArena
            fighter1={selectedFighterData}
            fighter2={opponentFighterData}
            battleActive={battleActive}
            isAttacking={isAttacking}
            currentRound={currentRound}
            fighter1Hp={f1Hp}
            fighter2Hp={f2Hp}
            fighter1MaxHp={f1MaxHp}
            fighter2MaxHp={f2MaxHp}
            narrationLog={narrationLog}
          />

          {/* Battle Complete Results */}
          <AnimatePresence>
            {battleComplete && battleResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glow-border-strong p-8 text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  🏆
                </motion.div>
                <h3 className="text-3xl font-bold text-accent mb-4">
                  {battleResult.winnerName} Wins!
                </h3>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                  <div className="stat-card text-center py-3">
                    <p className="text-xs text-gray-500">Rounds</p>
                    <p className="text-lg font-bold text-cyan-400">{battleResult.totalRounds}</p>
                  </div>
                  <div className="stat-card text-center py-3">
                    <p className="text-xs text-gray-500">XP Earned</p>
                    <p className="text-lg font-bold text-green-400">+{battleResult.xpReward}</p>
                  </div>
                  <div className="stat-card text-center py-3">
                    <p className="text-xs text-gray-500">Dominance</p>
                    <p className="text-lg font-bold text-purple-400">{battleResult.dominanceScore}%</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                  {selectedFighter === battleResult.winnerId
                    ? "Victory! Your fighter proved superior in combat."
                    : "Defeat. Analyze the battle log and adjust your strategy."}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="btn-primary py-3 px-8"
                >
                  New Battle
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <>
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex gap-4 border-b border-cyan-700"
          >
            {[
              { id: "create" as const, label: "Create Battle", icon: Plus },
              { id: "available" as const, label: "Active Battles", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </motion.div>

          {/* Create Battle Tab */}
          {activeTab === "create" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">Select Your Fighter</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableFighters.map((fighter) => (
                    <FighterCard
                      key={fighter.id}
                      fighter={fighter}
                      selected={selectedFighter === fighter.id}
                      onClick={() => setSelectedFighter(fighter.id)}
                      compact
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {selectedFighter && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />

                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Select Opponent</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableFighters.map((fighter) => (
                          <FighterCard
                            key={fighter.id}
                            fighter={fighter}
                            selected={opponentFighter === fighter.id}
                            onClick={() => setOpponentFighter(fighter.id)}
                            compact
                            disabled={selectedFighter === fighter.id}
                          />
                        ))}
                      </div>
                    </div>

                    {selectedFighter && opponentFighter && selectedFighterData && opponentFighterData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-bold text-cyan-400">Battle Preview</h2>
                        <BattleArena
                          fighter1={selectedFighterData}
                          fighter2={opponentFighterData}
                          battleActive={false}
                        />

                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0, 240, 255, 0.6)" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleStartBattle}
                          className="w-full btn-primary py-4 text-lg font-bold"
                        >
                          Start AI Battle
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Available Battles Tab */}
          {activeTab === "available" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">Active Battles</h2>

              {MOCK_FIGHTERS.slice(0, 2).map((fighter: Fighter, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glow-border p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">Fighter 1</p>
                      <FighterAvatar
                        name={fighter.name}
                        attack={fighter.stats.attack}
                        defense={fighter.stats.defense}
                        speed={fighter.stats.speed}
                        intelligence={fighter.stats.intelligence}
                        size={64}
                        animate
                        borderColor="#00f0ff"
                        className="mx-auto mb-2"
                      />
                      <p className="font-bold text-cyan-400">{fighter.name}</p>
                      <p className="text-sm text-gray-500">Lv. {fighter.level}</p>
                    </div>

                    <div className="flex justify-center">
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        VS
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">Fighter 2</p>
                      <FighterAvatar
                        name={MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].name}
                        attack={MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].stats.attack}
                        defense={MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].stats.defense}
                        speed={MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].stats.speed}
                        intelligence={MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].stats.intelligence}
                        size={64}
                        animate
                        borderColor="#7c3aed"
                        className="mx-auto mb-2"
                      />
                      <p className="font-bold text-purple-400">
                        {MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Lv. {MOCK_FIGHTERS[(idx + 1) % MOCK_FIGHTERS.length].level}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      toast.success("Spectating battle!")
                    }}
                    className="w-full mt-6 btn-secondary py-2"
                  >
                    Watch Battle
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
