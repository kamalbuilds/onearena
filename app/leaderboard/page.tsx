"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { MOCK_FIGHTERS } from "@/lib/constants"
import FighterCard from "@/components/fighter/fighter-card"
import { Search } from "lucide-react"
import { TrophyIcon, SwordIcon } from "@/components/ui/game-icons"
import type { LeaderboardEntry } from "@/lib/types"

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    return MOCK_FIGHTERS.map((fighter, idx) => ({
      rank: idx + 1,
      fighter,
      winRate: fighter.totalBattles > 0 ? (fighter.wins / fighter.totalBattles) * 100 : 0,
      totalBattles: fighter.totalBattles,
    }))
      .filter((entry) =>
        entry.fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.fighter.wins - a.fighter.wins)
  }, [searchTerm])

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="heading-glow text-5xl md:text-6xl mb-4">Leaderboard</h1>
        <p className="text-xl text-gray-400">
          See the top fighters on OneArena
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fighters..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-card-bg border-2 border-cyan-700 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-card-bg border-2 border-cyan-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded transition-all ${
              viewMode === "table"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-cyan-400"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded transition-all ${
              viewMode === "cards"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-cyan-400"
            }`}
          >
            Cards
          </button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {[
          { label: "Total Fighters", value: MOCK_FIGHTERS.length },
          { label: "Total Battles", value: MOCK_FIGHTERS.reduce((sum, f) => sum + f.totalBattles, 0) },
          { label: "Avg Win Rate", value: `${Math.round(MOCK_FIGHTERS.reduce((sum, f) => sum + (f.wins / f.totalBattles), 0) / MOCK_FIGHTERS.length * 100)}%` },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="stat-card text-center"
          >
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Table View */}
      {viewMode === "table" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glow-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-700 bg-card-bg">
                  <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Fighter</th>
                  <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Level</th>
                  <th className="px-6 py-4 text-center text-cyan-400 font-semibold">Record</th>
                  <th className="px-6 py-4 text-center text-cyan-400 font-semibold">Win Rate</th>
                  <th className="px-6 py-4 text-center text-cyan-400 font-semibold">Total Battles</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <motion.tr
                    key={entry.fighter.id}
                    variants={itemVariants}
                    className="border-b border-cyan-800 hover:bg-cyan-900/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                        {entry.rank <= 3 && (
                          <SwordIcon size={16} className="text-red-500 animate-pulse" glow />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-cyan-400">{entry.fighter.name}</p>
                        <p className="text-xs text-gray-500">
                          {entry.fighter.owner.slice(0, 6)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-sm font-semibold">
                        Lv. {entry.fighter.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold">
                        <span className="text-accent">{entry.fighter.wins}W</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-danger">{entry.fighter.losses}L</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`font-bold ${
                          entry.winRate >= 70
                            ? "text-accent"
                            : entry.winRate >= 50
                              ? "text-cyan-400"
                              : "text-gray-400"
                        }`}
                      >
                        {entry.winRate.toFixed(1)}%
                      </motion.div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">
                      {entry.totalBattles}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {leaderboard.map((entry) => (
            <motion.div key={entry.fighter.id} variants={itemVariants}>
              {/* Rank Badge */}
              <div className="relative -mb-8 z-10 flex justify-between items-start px-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{getMedalEmoji(entry.rank)}</div>
                  {entry.rank <= 3 && (
                    <SwordIcon size={20} className="text-red-500 animate-pulse" glow />
                  )}
                </div>
                <span className="text-sm font-bold text-cyan-400 bg-card-bg px-3 py-1 rounded-full">
                  #{entry.rank}
                </span>
              </div>

              <FighterCard fighter={entry.fighter} compact={false} />

              {/* Win Rate Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 p-4 rounded-lg bg-card-bg border border-cyan-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Win Rate</span>
                  <span className="font-bold text-cyan-400">
                    {entry.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded bg-black/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${entry.winRate}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {leaderboard.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <TrophyIcon size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No fighters found matching your search</p>
        </motion.div>
      )}
    </div>
  )
}
