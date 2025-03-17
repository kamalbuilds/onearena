import { motion } from "framer-motion"
import { SwordIcon, ShieldIcon, LightningIcon, BrainIcon } from "@/components/ui/game-icons"
import FighterAvatar from "@/components/ui/fighter-avatar"
import type { Fighter } from "@/lib/types"

interface FighterCardProps {
  fighter: Fighter
  onClick?: () => void
  selected?: boolean
  compact?: boolean
  disabled?: boolean
}

export default function FighterCard({
  fighter,
  onClick,
  selected = false,
  compact = false,
  disabled = false,
}: FighterCardProps) {
  const stats = [
    { label: "ATK", value: fighter.stats.attack, Icon: SwordIcon, color: "text-red-500" },
    { label: "DEF", value: fighter.stats.defense, Icon: ShieldIcon, color: "text-blue-500" },
    { label: "SPD", value: fighter.stats.speed, Icon: LightningIcon, color: "text-cyan-500" },
    { label: "INT", value: fighter.stats.intelligence, Icon: BrainIcon, color: "text-purple-500" },
  ]

  const winRate =
    fighter.totalBattles > 0
      ? Math.round((fighter.wins / fighter.totalBattles) * 100)
      : 0

  if (compact) {
    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
        onClick={!disabled ? onClick : undefined}
        className={`rounded-lg border-2 p-4 transition-all duration-300 ${
          disabled
            ? "border-gray-700 bg-gray-900/20 opacity-50 cursor-not-allowed"
            : selected
              ? "cursor-pointer border-cyan-400 bg-cyan-500/10 shadow-glow-strong"
              : "cursor-pointer border-cyan-600 bg-card-bg hover:border-cyan-400 hover:shadow-glow"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <FighterAvatar
            name={fighter.name}
            attack={fighter.stats.attack}
            defense={fighter.stats.defense}
            speed={fighter.stats.speed}
            intelligence={fighter.stats.intelligence}
            size={40}
            animate={false}
          />
          <h3 className="font-bold text-cyan-400">{fighter.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1">
              <stat.Icon size={14} className={stat.color} glow />
              <span className="text-gray-400">
                {stat.label} {stat.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Win Rate: {winRate}%</span>
            <span className="text-cyan-400">{fighter.wins}W-{fighter.losses}L</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
        selected
          ? "border-cyan-400 bg-cyan-500/10 shadow-glow-strong"
          : "border-cyan-600 bg-gradient-to-b from-card-bg to-purple-900/20 hover:border-cyan-400 hover:shadow-glow"
      }`}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card-bg/80" />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header with Avatar */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <FighterAvatar
              name={fighter.name}
              attack={fighter.stats.attack}
              defense={fighter.stats.defense}
              speed={fighter.stats.speed}
              intelligence={fighter.stats.intelligence}
              size={72}
              animate
            />
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {fighter.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">Lv. {fighter.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-cyan-400">
              {winRate}%
              <br />
              Win Rate
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded border border-cyan-700 bg-black/40 p-2 text-center"
            >
              <stat.Icon size={18} className={`mx-auto mb-1 ${stat.color}`} glow />
              <div className="text-xs font-bold text-gray-300">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Record */}
        <div className="flex justify-between items-center pt-3 border-t border-cyan-700">
          <div className="text-sm">
            <span className="text-accent font-bold">{fighter.wins}W</span>
            <span className="text-gray-500"> / </span>
            <span className="text-danger font-bold">{fighter.losses}L</span>
          </div>
          <div className="text-xs text-gray-400">
            {fighter.totalBattles} battles
          </div>
        </div>

        {/* Experience Bar */}
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Experience</div>
          <div className="h-2 rounded bg-black/60 border border-cyan-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((fighter.experience / 10000) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
