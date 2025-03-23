"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit"
import { CrossedSwordsIcon } from "@/components/ui/game-icons"
import { CONTRACT_CONFIG } from "@/lib/constants"
import FighterCard from "@/components/fighter/fighter-card"
import type { Fighter } from "@/lib/types"
import { AlertCircle, RefreshCw, Swords, Sparkles, Trophy } from "lucide-react"
import Link from "next/link"

export default function MyFightersPage() {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const [fighters, setFighters] = useState<Fighter[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null)

  const fetchFighters = useCallback(async () => {
    if (!account?.address) return
    setLoading(true)
    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${CONTRACT_CONFIG.packageId}::fighter::Fighter`,
        },
        options: { showContent: true, showDisplay: true },
      })

      const parsed: Fighter[] = objects.data
        .filter((obj) => obj.data?.content?.dataType === "moveObject")
        .map((obj) => {
          const fields = (obj.data?.content as { fields?: Record<string, unknown> })?.fields || {}
          return {
            id: obj.data?.objectId || "",
            name: (fields.name as string) || "Unknown Fighter",
            owner: account.address,
            level: Number(fields.level || 1),
            experience: Number(fields.experience || 0),
            stats: {
              attack: Number((fields as Record<string, unknown>).attack || 50),
              defense: Number((fields as Record<string, unknown>).defense || 50),
              speed: Number((fields as Record<string, unknown>).speed || 50),
              intelligence: Number((fields as Record<string, unknown>).intelligence || 50),
            },
            wins: Number(fields.wins || 0),
            losses: Number(fields.losses || 0),
            totalBattles: Number(fields.wins || 0) + Number(fields.losses || 0),
          }
        })

      setFighters(parsed)
    } catch (error) {
      console.error("Error fetching fighters:", error)
      setFighters([])
    } finally {
      setLoading(false)
    }
  }, [account, client])

  useEffect(() => {
    fetchFighters()
  }, [fetchFighters])

  const selectedFighterData = fighters.find((f) => f.id === selectedFighter)

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-glow text-5xl md:text-6xl mb-4">My Fighters</h1>
          <p className="text-xl text-gray-400">
            Your collection of AI-powered NFT warriors
          </p>
        </div>
        {account && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchFighters}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 self-start"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        )}
      </motion.div>

      {!account ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-lg border-2 border-yellow-600 bg-yellow-600/10 text-center"
        >
          <AlertCircle className="mx-auto text-yellow-400 mb-4" size={48} />
          <h3 className="font-bold text-yellow-400 mb-2 text-xl">Wallet Required</h3>
          <p className="text-yellow-300 mb-6">
            Connect your OneWallet to view your fighter collection
          </p>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mb-4"
          />
          <p className="text-gray-400">Scanning OneChain for your fighters...</p>
        </div>
      ) : fighters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6"
          >
            <CrossedSwordsIcon size={64} className="text-cyan-400 mx-auto" glow />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-300 mb-4">No Fighters Yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your arena awaits! Mint your first AI fighter and start battling on OneChain.
          </p>
          <Link href="/mint">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 240, 255, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              <Sparkles size={20} />
              Mint Your First Fighter
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Fighters", value: fighters.length, icon: Swords },
              { label: "Total Wins", value: fighters.reduce((s, f) => s + f.wins, 0), icon: Trophy },
              { label: "Total Battles", value: fighters.reduce((s, f) => s + f.totalBattles, 0), icon: Sparkles },
              {
                label: "Win Rate",
                value: `${fighters.reduce((s, f) => s + f.totalBattles, 0) > 0
                  ? Math.round((fighters.reduce((s, f) => s + f.wins, 0) / fighters.reduce((s, f) => s + f.totalBattles, 0)) * 100)
                  : 0}%`,
                icon: Trophy,
              },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="stat-card text-center"
                >
                  <Icon size={20} className="text-cyan-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-cyan-400">{stat.value}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Fighter Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {fighters.map((fighter, idx) => (
                <motion.div
                  key={fighter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <FighterCard
                    fighter={fighter}
                    selected={selectedFighter === fighter.id}
                    onClick={() => setSelectedFighter(selectedFighter === fighter.id ? null : fighter.id)}
                  />

                  {/* Action buttons when selected */}
                  <AnimatePresence>
                    {selectedFighter === fighter.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex gap-3"
                      >
                        <Link href="/battle" className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                          >
                            <Swords size={16} />
                            Battle
                          </motion.button>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Mint More CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link href="/mint">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Sparkles size={16} />
                Mint Another Fighter
              </motion.button>
            </Link>
          </motion.div>
        </>
      )}

      {/* Fighter Detail Modal */}
      <AnimatePresence>
        {selectedFighterData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedFighter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <FighterCard fighter={selectedFighterData} />
              <div className="mt-4 flex gap-3">
                <Link href="/battle" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    <Swords size={18} />
                    Send to Battle
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedFighter(null)}
                  className="btn-secondary py-3 px-6"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
