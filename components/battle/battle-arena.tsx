"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SwordIcon, ShieldIcon, SparkleIcon, HeartIcon } from "@/components/ui/game-icons"
import FighterAvatar from "@/components/ui/fighter-avatar"
import ArenaBackground from "@/components/ui/arena-background"
import type { Fighter } from "@/lib/types"

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

interface BattleArenaProps {
  fighter1: Fighter
  fighter2: Fighter
  isAttacking?: "fighter1" | "fighter2" | null
  battleActive?: boolean
  currentRound?: BattleRound | null
  fighter1Hp?: number
  fighter2Hp?: number
  fighter1MaxHp?: number
  fighter2MaxHp?: number
  narrationLog?: string[]
  onMoveSelect?: (move: number) => void
  showMoves?: boolean
}

export default function BattleArena({
  fighter1,
  fighter2,
  isAttacking = null,
  battleActive = false,
  currentRound = null,
  fighter1Hp,
  fighter2Hp,
  fighter1MaxHp,
  fighter2MaxHp,
  narrationLog = [],
  onMoveSelect,
  showMoves = false,
}: BattleArenaProps) {
  const f1MaxHp = fighter1MaxHp || Math.round(fighter1.stats.defense * 1.5 + 100)
  const f2MaxHp = fighter2MaxHp || Math.round(fighter2.stats.defense * 1.5 + 100)
  const f1Hp = fighter1Hp ?? f1MaxHp
  const f2Hp = fighter2Hp ?? f2MaxHp
  const f1HpPct = Math.max(0, (f1Hp / f1MaxHp) * 100)
  const f2HpPct = Math.max(0, (f2Hp / f2MaxHp) * 100)

  const getHpColor = (pct: number) => {
    if (pct > 60) return "from-green-500 to-green-400"
    if (pct > 30) return "from-yellow-500 to-orange-400"
    return "from-red-600 to-red-400"
  }

  const getMoveIcon = (move: number) => {
    if (move === 0) return <SwordIcon size={24} className="text-red-400" glow />
    if (move === 1) return <ShieldIcon size={24} className="text-blue-400" glow />
    return <SparkleIcon size={24} className="text-yellow-400" glow />
  }

  return (
    <div className="w-full rounded-xl border-2 border-cyan-600 bg-gradient-to-b from-purple-900/20 to-card-bg p-6 md:p-8 space-y-6 overflow-hidden relative">
      {/* Animated Arena Background */}
      <ArenaBackground
        active={battleActive}
        intensity={battleActive ? "high" : "low"}
      />

      {/* Arena Title */}
      <div className="text-center mb-2 relative z-10">
        <h2 className="heading-glow text-2xl md:text-3xl">ARENA</h2>
        <p className="text-sm text-cyan-400 mt-1">
          {battleActive ? "Battle in Progress" : currentRound ? "Battle Complete" : "Ready for Battle"}
        </p>
      </div>

      {/* Fighters Container */}
      <div className="relative flex items-center justify-between gap-4 md:gap-8 z-10">
        {/* Fighter 1 */}
        <motion.div
          animate={isAttacking === "fighter1" ? { x: [0, 30, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center flex-1"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Damage flash */}
            <AnimatePresence>
              {isAttacking === "fighter2" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-red-500/40 rounded-full z-20"
                />
              )}
            </AnimatePresence>

            <FighterAvatar
              name={fighter1.name}
              attack={fighter1.stats.attack}
              defense={fighter1.stats.defense}
              speed={fighter1.stats.speed}
              intelligence={fighter1.stats.intelligence}
              size={120}
              animate={battleActive}
              borderColor="#00f0ff"
            />
          </motion.div>

          <div className="font-bold text-sm text-cyan-400 truncate max-w-[120px] mt-2 text-center">
            {fighter1.name}
          </div>
          <div className="text-xs text-gray-400">Lv. {fighter1.level}</div>

          {/* HP Bar */}
          <div className="mt-3 space-y-1 w-full px-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-cyan-400 flex items-center gap-1">
                <HeartIcon size={12} className="text-cyan-400" /> HP
              </span>
              <span className="text-gray-300">{f1Hp}/{f1MaxHp}</span>
            </div>
            <div className="h-3 rounded-full bg-black/60 border border-cyan-600 overflow-hidden">
              <motion.div
                animate={{ width: `${f1HpPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${getHpColor(f1HpPct)}`}
              />
            </div>
          </div>

          {/* Current move indicator */}
          <AnimatePresence>
            {currentRound && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="mt-2"
              >
                {getMoveIcon(currentRound.fighter1Move)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center VS */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={battleActive ? { scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            VS
          </motion.div>
          {battleActive && (
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-2"
            >
              <SparkleIcon size={24} className="text-yellow-400" glow />
            </motion.div>
          )}

          {/* Damage numbers */}
          <AnimatePresence>
            {currentRound && currentRound.fighter1Damage > 0 && (
              <motion.div
                key={`dmg1-${currentRound.round}`}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [1, 1, 0], y: -30 }}
                transition={{ duration: 1 }}
                className={`absolute top-1/2 right-1/4 text-lg font-black ${currentRound.critical ? "text-yellow-400" : "text-red-400"}`}
              >
                -{currentRound.fighter1Damage}
              </motion.div>
            )}
            {currentRound && currentRound.fighter2Damage > 0 && (
              <motion.div
                key={`dmg2-${currentRound.round}`}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [1, 1, 0], y: -30 }}
                transition={{ duration: 1 }}
                className={`absolute top-1/2 left-1/4 text-lg font-black ${currentRound.critical ? "text-yellow-400" : "text-red-400"}`}
              >
                -{currentRound.fighter2Damage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fighter 2 */}
        <motion.div
          animate={isAttacking === "fighter2" ? { x: [0, -30, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center flex-1"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <AnimatePresence>
              {isAttacking === "fighter1" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-red-500/40 rounded-full z-20"
                />
              )}
            </AnimatePresence>

            <FighterAvatar
              name={fighter2.name}
              attack={fighter2.stats.attack}
              defense={fighter2.stats.defense}
              speed={fighter2.stats.speed}
              intelligence={fighter2.stats.intelligence}
              size={120}
              animate={battleActive}
              borderColor="#7c3aed"
            />
          </motion.div>

          <div className="font-bold text-sm text-purple-400 truncate max-w-[120px] mt-2 text-center">
            {fighter2.name}
          </div>
          <div className="text-xs text-gray-400">Lv. {fighter2.level}</div>

          <div className="mt-3 space-y-1 w-full px-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-purple-400 flex items-center gap-1">
                <HeartIcon size={12} className="text-purple-400" /> HP
              </span>
              <span className="text-gray-300">{f2Hp}/{f2MaxHp}</span>
            </div>
            <div className="h-3 rounded-full bg-black/60 border border-purple-600 overflow-hidden">
              <motion.div
                animate={{ width: `${f2HpPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${getHpColor(f2HpPct)}`}
              />
            </div>
          </div>

          <AnimatePresence>
            {currentRound && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="mt-2"
              >
                {getMoveIcon(currentRound.fighter2Move)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Narration Log */}
      {narrationLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-4 max-h-48 overflow-y-auto rounded-lg bg-black/40 border border-cyan-800 p-4 space-y-2 scrollbar-thin"
        >
          {narrationLog.map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`text-sm ${idx === narrationLog.length - 1 ? "text-cyan-300 font-semibold" : "text-gray-400"}`}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      )}

      {/* Move Buttons */}
      {showMoves && onMoveSelect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-3 gap-3 relative z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoveSelect(0)}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-600/10 px-4 py-3 font-semibold text-red-400 hover:border-red-400 hover:bg-red-600/20 transition-all"
          >
            <SwordIcon size={18} className="text-red-400" />
            Attack
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoveSelect(1)}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-600/10 px-4 py-3 font-semibold text-blue-400 hover:border-blue-400 hover:bg-blue-600/20 transition-all"
          >
            <ShieldIcon size={18} className="text-blue-400" />
            Defend
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoveSelect(2)}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-yellow-600 bg-yellow-600/10 px-4 py-3 font-semibold text-yellow-400 hover:border-yellow-400 hover:bg-yellow-600/20 transition-all"
          >
            <SparkleIcon size={18} className="text-yellow-400" />
            Special
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
