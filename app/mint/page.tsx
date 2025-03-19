"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@onelabs/dapp-kit"
import { Transaction } from "@onelabs/sui/transactions"
import { CONTRACT_CONFIG, STAT_CONSTRAINTS } from "@/lib/constants"
import type { MintFormData, FighterStats } from "@/lib/types"
import { toast } from "sonner"
import { AlertCircle, CheckCircle } from "lucide-react"
import { SwordIcon, ShieldIcon, LightningIcon, BrainIcon, CrossedSwordsIcon, SparkleIcon } from "@/components/ui/game-icons"
import FighterAvatar from "@/components/ui/fighter-avatar"

export default function MintPage() {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const [formData, setFormData] = useState<MintFormData>({
    name: "",
    attack: 75,
    defense: 70,
    speed: 80,
    intelligence: 75,
  })

  const [mintSuccess, setMintSuccess] = useState(false)

  const totalPoints = useMemo(() => {
    return formData.attack + formData.defense + formData.speed + formData.intelligence
  }, [formData])

  const isValidPoints = totalPoints <= STAT_CONSTRAINTS.totalPointsLimit
  const pointsRemaining = STAT_CONSTRAINTS.totalPointsLimit - totalPoints

  const handleStatChange = (stat: keyof FighterStats, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [stat]: Math.min(
        Math.max(value, STAT_CONSTRAINTS.minStatPoints),
        STAT_CONSTRAINTS.maxStatPoints
      ),
    }))
  }

  const handleMint = useCallback(async () => {
    if (!account) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Fighter name is required")
      return
    }

    if (!isValidPoints) {
      toast.error(`Total stat points cannot exceed ${STAT_CONSTRAINTS.totalPointsLimit}`)
      return
    }

    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::fighter::mint_fighter`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.u64(formData.attack),
          tx.pure.u64(formData.defense),
          tx.pure.u64(formData.speed),
          tx.pure.u64(formData.intelligence),
        ],
      })

      const result = await signAndExecute({ transaction: tx })
      toast.success(`Fighter "${formData.name}" minted! TX: ${result.digest.slice(0, 8)}...`)
      setMintSuccess(true)

      setTimeout(() => setMintSuccess(false), 5000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      if (message.includes("rejected")) {
        toast.error("Transaction rejected by wallet")
      } else {
        toast.error(`Mint failed: ${message.slice(0, 100)}`)
      }
      console.error("Mint error:", error)
    }
  }, [account, formData, isValidPoints, signAndExecute])

  const stats = [
    { key: "attack" as const, label: "Attack", color: "from-red-600 to-orange-400", IconComponent: SwordIcon, iconColor: "text-red-400" },
    { key: "defense" as const, label: "Defense", color: "from-blue-600 to-blue-400", IconComponent: ShieldIcon, iconColor: "text-blue-400" },
    { key: "speed" as const, label: "Speed", color: "from-cyan-600 to-cyan-400", IconComponent: LightningIcon, iconColor: "text-cyan-400" },
    { key: "intelligence" as const, label: "Intelligence", color: "from-purple-600 to-purple-400", IconComponent: BrainIcon, iconColor: "text-purple-400" },
  ]

  // Fighter class determination
  const getFighterClass = () => {
    const maxStat = Math.max(formData.attack, formData.defense, formData.speed, formData.intelligence)
    if (maxStat === formData.attack) return { name: "Berserker", color: "text-red-400", IconComp: SwordIcon, iconColor: "text-red-400" }
    if (maxStat === formData.defense) return { name: "Guardian", color: "text-blue-400", IconComp: ShieldIcon, iconColor: "text-blue-400" }
    if (maxStat === formData.speed) return { name: "Assassin", color: "text-cyan-400", IconComp: LightningIcon, iconColor: "text-cyan-400" }
    return { name: "Sage", color: "text-purple-400", IconComp: BrainIcon, iconColor: "text-purple-400" }
  }

  const fighterClass = getFighterClass()

  // Radar chart points calculation
  const radarPoints = stats.map((stat, idx) => {
    const angle = (idx / stats.length) * Math.PI * 2 - Math.PI / 2
    const radius = (formData[stat.key] / 100) * 80
    const x = 150 + radius * Math.cos(angle)
    const y = 150 + radius * Math.sin(angle)
    return [x, y]
  })

  const radarPath = radarPoints.map((point, idx) => (idx === 0 ? `M${point[0]},${point[1]}` : `L${point[0]},${point[1]}`)).join(" ") + " Z"

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="heading-glow text-5xl md:text-6xl mb-4">Forge Your Fighter</h1>
        <p className="text-xl text-gray-400">
          Allocate stat points to create a unique AI-powered NFT warrior
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
              Connect your OneWallet to mint a fighter on OneChain
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {mintSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="mb-8 p-6 rounded-lg border-2 border-green-500 bg-green-500/10 flex gap-4"
          >
            <SparkleIcon size={24} className="text-green-400 flex-shrink-0" glow />
            <div>
              <h3 className="font-bold text-green-400 mb-1">Fighter Minted!</h3>
              <p className="text-sm text-green-300">
                Your fighter is now an NFT on OneChain. Check "My Fighters" to see it!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Fighter Name */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-cyan-400">Fighter Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter a legendary name..."
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-card-bg border-2 border-cyan-700 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors text-lg"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{formData.name.length}/50</p>
              {formData.name && (
                <p className={`text-sm font-semibold ${fighterClass.color} flex items-center gap-1`}>
                  <fighterClass.IconComp size={16} className={fighterClass.iconColor} glow />
                  {fighterClass.name} Class
                </p>
              )}
            </div>
          </div>

          {/* Stats Sliders */}
          <div className="space-y-6">
            {stats.map((stat) => (
              <motion.div key={stat.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-lg font-semibold">
                    <stat.IconComponent size={28} className={stat.iconColor} glow />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                      {stat.label}
                    </span>
                  </label>
                  <span className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {formData[stat.key]}
                  </span>
                </div>

                <input
                  type="range"
                  min={STAT_CONSTRAINTS.minStatPoints}
                  max={STAT_CONSTRAINTS.maxStatPoints}
                  value={formData[stat.key]}
                  onChange={(e) => handleStatChange(stat.key, parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg bg-card-bg border border-cyan-700 appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{STAT_CONSTRAINTS.minStatPoints}</span>
                  <div className="flex-1" />
                  <span>{STAT_CONSTRAINTS.maxStatPoints}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Points Counter */}
          <motion.div
            className={`p-4 rounded-lg border-2 ${
              isValidPoints
                ? "border-accent bg-green-600/10"
                : "border-danger bg-red-600/10"
            }`}
          >
            <div className="flex items-center gap-3">
              {isValidPoints ? (
                <CheckCircle size={24} className="text-accent" />
              ) : (
                <AlertCircle size={24} className="text-danger" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-300">Stat Points</p>
                <p className={`text-sm ${isValidPoints ? "text-accent" : "text-danger"}`}>
                  {totalPoints}/{STAT_CONSTRAINTS.totalPointsLimit} used
                  {isValidPoints && ` (${pointsRemaining} remaining)`}
                </p>
              </div>
              {/* Points bar */}
              <div className="w-32 h-3 rounded-full bg-black/60 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min((totalPoints / STAT_CONSTRAINTS.totalPointsLimit) * 100, 100)}%` }}
                  className={`h-full ${isValidPoints ? "bg-gradient-to-r from-cyan-500 to-green-500" : "bg-gradient-to-r from-red-500 to-red-600"}`}
                />
              </div>
            </div>
          </motion.div>

          {/* Mint Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMint}
            disabled={isPending || !isValidPoints || !account || !formData.name.trim()}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isPending || !isValidPoints || !account || !formData.name.trim()
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
                Minting on OneChain...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CrossedSwordsIcon size={20} className="text-white" />
                Mint Fighter NFT
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-start"
        >
          <div className="w-full max-w-sm sticky top-24">
            {/* Fighter Card Preview */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border-2 border-cyan-600 bg-gradient-to-b from-card-bg to-purple-900/20 p-8 text-center relative overflow-hidden"
            >
              {/* Animated background glow based on class */}
              <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10"
              />

              <div className="relative z-10 space-y-6">
                {/* Fighter Avatar */}
                <div className="flex justify-center">
                  <FighterAvatar
                    name={formData.name || "???"}
                    attack={formData.attack}
                    defense={formData.defense}
                    speed={formData.speed}
                    intelligence={formData.intelligence}
                    size={120}
                    animate
                  />
                </div>

                {/* Name & Class */}
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    {formData.name || "???"}
                  </h2>
                  <p className={`mt-2 font-semibold ${fighterClass.color}`}>
                    {fighterClass.name} Class
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Level 1</p>
                </div>

                {/* Stats Display */}
                <div className="space-y-3 text-left">
                  {stats.map((stat) => (
                    <div key={stat.key} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-400">
                        {stat.label}
                      </span>
                      <div className="flex-1 mx-3 h-2 rounded bg-black/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(formData[stat.key] / STAT_CONSTRAINTS.maxStatPoints) * 100}%` }}
                          className={`h-full bg-gradient-to-r ${stat.color}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-300 w-8 text-right">
                        {formData[stat.key]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="flex justify-center py-4">
                  <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full">
                    {/* Grid */}
                    {[1, 2, 3, 4].map((r) => (
                      <circle
                        key={`grid-${r}`}
                        cx="150"
                        cy="150"
                        r={r * 20}
                        fill="none"
                        stroke="#4d1a7a"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    ))}

                    {/* Axes */}
                    {radarPoints.map((point, idx) => (
                      <line
                        key={`axis-${idx}`}
                        x1="150"
                        y1="150"
                        x2={point[0]}
                        y2={point[1]}
                        stroke="#4d1a7a"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    ))}

                    {/* Stat Polygon */}
                    <motion.path
                      d={radarPath}
                      fill="url(#radarGradient)"
                      fillOpacity="0.3"
                      stroke="#00f0ff"
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />

                    {/* Gradient */}
                    <defs>
                      <linearGradient
                        id="radarGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>

                    {/* Points */}
                    {radarPoints.map((point, idx) => (
                      <circle
                        key={`point-${idx}`}
                        cx={point[0]}
                        cy={point[1]}
                        r="4"
                        fill="#00f0ff"
                        opacity="0.7"
                      />
                    ))}

                    {/* Labels */}
                    {stats.map((stat, idx) => {
                      const angle = (idx / stats.length) * Math.PI * 2 - Math.PI / 2
                      const x = 150 + 110 * Math.cos(angle)
                      const y = 150 + 110 * Math.sin(angle)
                      return (
                        <text
                          key={`label-${idx}`}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="12"
                          fill="#9d4edd"
                          fontWeight="bold"
                        >
                          {stat.label.substring(0, 3)}
                        </text>
                      )
                    })}
                  </svg>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 text-xs border-t border-cyan-700 pt-4">
                  <div className="text-center">
                    <p className="text-gray-500">Power</p>
                    <p className="text-cyan-400 font-bold">{totalPoints}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Average</p>
                    <p className="text-cyan-400 font-bold">
                      {Math.round(totalPoints / 4)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Class</p>
                    <p className={`font-bold ${fighterClass.color}`}>{fighterClass.name}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 glow-border p-4 text-center"
            >
              <p className="text-sm text-gray-400 mb-2">
                Your fighter will be minted as an NFT on OneChain and can battle in the Arena!
              </p>
              <p className="text-xs text-cyan-400">Powered by AI Strategy Engine</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
