"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users } from "lucide-react"
import {
  LightningIcon,
  TrophyIcon,
  SparkleIcon,
  BrainIcon,
  CrossedSwordsIcon,
  ShieldIcon,
} from "@/components/ui/game-icons"
import FighterAvatar from "@/components/ui/fighter-avatar"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 3,
    }))
    setParticles(newParticles)
  }, [])

  const stats = [
    { label: "Fighters Minted", value: "1,234", Icon: CrossedSwordsIcon },
    { label: "Battles Fought", value: "5,678", Icon: LightningIcon },
    { label: "Prize Pool", value: "$45.2K", Icon: TrophyIcon },
  ]

  const features = [
    {
      Icon: SparkleIcon,
      title: "Mint AI Fighters",
      description: "Create unique NFT fighters with custom stat distributions. Each fighter is a distinct on-chain entity.",
      link: "/mint",
      color: "from-cyan-500 to-blue-500",
    },
    {
      Icon: BrainIcon,
      title: "AI Strategy Engine",
      description: "Our AI analyzes stats, predicts moves, and generates real-time battle narration. Every fight tells a story.",
      link: "/battle",
      color: "from-purple-500 to-pink-500",
    },
    {
      Icon: TrophyIcon,
      title: "Compete & Earn",
      description: "Win battles to earn XP, climb the leaderboard, and prove your fighter is the strongest on OneChain.",
      link: "/leaderboard",
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const howItWorks = [
    { step: "01", title: "Mint", desc: "Allocate stat points to forge your unique fighter NFT", Icon: SparkleIcon },
    { step: "02", title: "Strategize", desc: "AI analyzes matchups and recommends optimal moves", Icon: BrainIcon },
    { step: "03", title: "Battle", desc: "Watch AI-narrated combat with real-time animations", Icon: CrossedSwordsIcon },
    { step: "04", title: "Dominate", desc: "Earn XP, level up, and climb the global leaderboard", Icon: TrophyIcon },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        />

        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-700 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LightningIcon size={14} className="text-cyan-400" />
            </motion.div>
            Built on OneChain
          </motion.div>

          <motion.h1
            className="heading-glow text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            OneArena
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl text-cyan-300 max-w-3xl mx-auto mb-4 font-semibold"
          >
            What if your NFTs could think?
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12"
          >
            AI-powered NFT fighters that strategize, battle, and evolve on OneChain.
            Every fight is narrated by AI. Every move matters.
          </motion.p>

          {/* Hero Fighter Showcase */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-end gap-4 md:gap-8 mb-12"
          >
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="opacity-60 hidden sm:block"
            >
              <FighterAvatar name="ShadowBlade" attack={90} defense={40} speed={85} intelligence={45} size={80} borderColor="#ef4444" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <FighterAvatar name="IronGuard" attack={50} defense={95} speed={40} intelligence={60} size={120} borderColor="#00f0ff" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="opacity-60 hidden sm:block"
            >
              <FighterAvatar name="NeonSage" attack={45} defense={50} speed={55} intelligence={95} size={80} borderColor="#a855f7" />
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link href="/mint">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 240, 255, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                <SparkleIcon size={20} className="text-white" />
                Mint Fighter
              </motion.button>
            </Link>
            <Link href="/battle">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 240, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                <CrossedSwordsIcon size={20} className="text-cyan-400" />
                Enter Arena
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
        >
          {stats.map((stat, index) => {
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="stat-card text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                  className="mb-4 inline-block"
                >
                  <stat.Icon size={36} className="text-cyan-400" glow />
                </motion.div>
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {stat.value}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* How It Works */}
        <motion.div variants={itemVariants} className="mb-24">
          <h2 className="heading-glow text-4xl md:text-5xl text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="relative glow-border p-6 text-center group"
                >
                  {/* Step number */}
                  <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-card-bg border border-cyan-600 text-xs font-bold text-cyan-400">
                    {item.step}
                  </div>

                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    className="mb-4 mt-2 inline-block"
                  >
                    <item.Icon size={40} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" glow />
                  </motion.div>

                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>

                  {/* Connection line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="mb-24">
          <h2 className="heading-glow text-4xl md:text-5xl text-center mb-16">
            Why OneArena?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03, y: -8 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glow-border p-8 cursor-pointer group"
                  onClick={() => (window.location.href = feature.link)}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.Icon size={32} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-cyan-400 mb-3 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.div
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center text-cyan-400 font-semibold gap-2 group-hover:gap-3 transition-all text-sm"
                  >
                    Explore
                    <span>→</span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Tech Stack Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-24"
        >
          <div className="glow-border p-6 md:p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Powered By</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { label: "OneChain", IconEl: LightningIcon },
                  { label: "Move Smart Contracts", IconEl: ShieldIcon },
                  { label: "AI Strategy Engine", IconEl: BrainIcon },
                  { label: "NFT Fighters", IconEl: CrossedSwordsIcon },
                  { label: "Real-time Narration", IconEl: SparkleIcon },
                ].map((tech, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 rounded-full border border-cyan-700 bg-card-bg text-sm text-gray-300 flex items-center gap-2"
                  >
                    <tech.IconEl size={16} className="text-cyan-400" />
                    {tech.label}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          variants={itemVariants}
          className="text-center pb-20"
        >
          <p className="text-gray-500 mb-6">Ready to enter the arena?</p>
          <Link href="/mint">
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(0, 240, 255, 0.8)" }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-10 py-4"
            >
              Start Your Journey
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
