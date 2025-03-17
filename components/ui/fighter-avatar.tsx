"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface FighterAvatarProps {
  name: string
  attack: number
  defense: number
  speed: number
  intelligence: number
  size?: number
  animate?: boolean
  borderColor?: string
  className?: string
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export default function FighterAvatar({
  name,
  attack,
  defense,
  speed,
  intelligence,
  size = 200,
  animate = true,
  borderColor = "#00f0ff",
  className = "",
}: FighterAvatarProps) {
  const avatar = useMemo(() => {
    const seed = hashString(name || "default")
    const rand = seededRandom(seed)

    // Determine dominant stat for silhouette style
    const maxStat = Math.max(attack, defense, speed, intelligence)
    const fighterType =
      maxStat === attack ? "berserker" :
      maxStat === defense ? "guardian" :
      maxStat === speed ? "assassin" : "sage"

    // Generate colors from seed
    const hue1 = Math.floor(rand() * 360)
    const hue2 = (hue1 + 120 + Math.floor(rand() * 60)) % 360
    const primaryColor = `hsl(${hue1}, 80%, 60%)`
    const secondaryColor = `hsl(${hue2}, 70%, 50%)`
    const accentColor = `hsl(${(hue1 + 60) % 360}, 90%, 70%)`

    // Body proportions based on stats
    const shoulderWidth = 24 + (defense / 100) * 16
    const headSize = 12 + (intelligence / 100) * 6
    const legLength = 20 + (speed / 100) * 10
    const armWidth = 3 + (attack / 100) * 4

    // Armor/accessory patterns
    const hasHelmet = defense > 60
    const hasAura = intelligence > 70
    const hasCape = rand() > 0.5
    const hasWeapon = attack > 50
    const eyeStyle = Math.floor(rand() * 4)
    const armorPattern = Math.floor(rand() * 3)

    return {
      fighterType,
      primaryColor,
      secondaryColor,
      accentColor,
      shoulderWidth,
      headSize,
      legLength,
      armWidth,
      hasHelmet,
      hasAura,
      hasCape,
      hasWeapon,
      eyeStyle,
      armorPattern,
      seed,
    }
  }, [name, attack, defense, speed, intelligence])

  const cx = 50
  const cy = 50
  const id = `avatar-${avatar.seed}`

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -4, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body gradient */}
          <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={avatar.primaryColor} />
            <stop offset="100%" stopColor={avatar.secondaryColor} />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Aura gradient */}
          <radialGradient id={`${id}-aura`}>
            <stop offset="0%" stopColor={avatar.accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={avatar.accentColor} stopOpacity="0" />
          </radialGradient>

          {/* Armor pattern */}
          <pattern id={`${id}-pattern`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            {avatar.armorPattern === 0 && (
              <circle cx="3" cy="3" r="1" fill={avatar.accentColor} opacity="0.3" />
            )}
            {avatar.armorPattern === 1 && (
              <line x1="0" y1="6" x2="6" y2="0" stroke={avatar.accentColor} strokeWidth="0.5" opacity="0.3" />
            )}
            {avatar.armorPattern === 2 && (
              <rect x="1" y="1" width="2" height="2" fill={avatar.accentColor} opacity="0.2" />
            )}
          </pattern>
        </defs>

        {/* Aura effect */}
        {avatar.hasAura && (
          <motion.circle
            cx={cx}
            cy={cy - 5}
            r="35"
            fill={`url(#${id}-aura)`}
            animate={{ r: [33, 37, 33], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Cape */}
        {avatar.hasCape && (
          <motion.path
            d={`M${cx - avatar.shoulderWidth / 2 + 2},${cy - 8}
                Q${cx - avatar.shoulderWidth / 2 - 8},${cy + 15} ${cx - 10},${cy + 25}
                L${cx + 10},${cy + 25}
                Q${cx + avatar.shoulderWidth / 2 + 8},${cy + 15} ${cx + avatar.shoulderWidth / 2 - 2},${cy - 8}Z`}
            fill={avatar.secondaryColor}
            opacity="0.4"
            animate={animate ? { d: [
              `M${cx - avatar.shoulderWidth / 2 + 2},${cy - 8} Q${cx - avatar.shoulderWidth / 2 - 8},${cy + 15} ${cx - 10},${cy + 25} L${cx + 10},${cy + 25} Q${cx + avatar.shoulderWidth / 2 + 8},${cy + 15} ${cx + avatar.shoulderWidth / 2 - 2},${cy - 8}Z`,
              `M${cx - avatar.shoulderWidth / 2 + 2},${cy - 8} Q${cx - avatar.shoulderWidth / 2 - 10},${cy + 18} ${cx - 12},${cy + 27} L${cx + 12},${cy + 27} Q${cx + avatar.shoulderWidth / 2 + 10},${cy + 18} ${cx + avatar.shoulderWidth / 2 - 2},${cy - 8}Z`,
              `M${cx - avatar.shoulderWidth / 2 + 2},${cy - 8} Q${cx - avatar.shoulderWidth / 2 - 8},${cy + 15} ${cx - 10},${cy + 25} L${cx + 10},${cy + 25} Q${cx + avatar.shoulderWidth / 2 + 8},${cy + 15} ${cx + avatar.shoulderWidth / 2 - 2},${cy - 8}Z`,
            ]} : {}}
            transition={{ duration: 4, repeat: Infinity }}
          />
        )}

        {/* Legs */}
        <line
          x1={cx - 6}
          y1={cy + 10}
          x2={cx - 8}
          y2={cy + 10 + avatar.legLength}
          stroke={`url(#${id}-body)`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1={cx + 6}
          y1={cy + 10}
          x2={cx + 8}
          y2={cy + 10 + avatar.legLength}
          stroke={`url(#${id}-body)`}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Feet */}
        <ellipse cx={cx - 9} cy={cy + 10 + avatar.legLength} rx="4" ry="2" fill={avatar.primaryColor} opacity="0.8" />
        <ellipse cx={cx + 9} cy={cy + 10 + avatar.legLength} rx="4" ry="2" fill={avatar.primaryColor} opacity="0.8" />

        {/* Body / Torso */}
        <path
          d={`M${cx},${cy - 12}
              L${cx + avatar.shoulderWidth / 2},${cy - 6}
              L${cx + avatar.shoulderWidth / 2 - 4},${cy + 12}
              L${cx - avatar.shoulderWidth / 2 + 4},${cy + 12}
              L${cx - avatar.shoulderWidth / 2},${cy - 6}Z`}
          fill={`url(#${id}-body)`}
          opacity="0.85"
          stroke={avatar.accentColor}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />

        {/* Armor pattern overlay */}
        <path
          d={`M${cx},${cy - 12}
              L${cx + avatar.shoulderWidth / 2},${cy - 6}
              L${cx + avatar.shoulderWidth / 2 - 4},${cy + 12}
              L${cx - avatar.shoulderWidth / 2 + 4},${cy + 12}
              L${cx - avatar.shoulderWidth / 2},${cy - 6}Z`}
          fill={`url(#${id}-pattern)`}
        />

        {/* Belt */}
        <rect x={cx - avatar.shoulderWidth / 2 + 4} y={cy + 8} width={avatar.shoulderWidth - 8} height="3" rx="1" fill={avatar.accentColor} opacity="0.5" />

        {/* Arms */}
        <line
          x1={cx - avatar.shoulderWidth / 2}
          y1={cy - 6}
          x2={cx - avatar.shoulderWidth / 2 - 6}
          y2={cy + 14}
          stroke={`url(#${id}-body)`}
          strokeWidth={avatar.armWidth}
          strokeLinecap="round"
        />
        <line
          x1={cx + avatar.shoulderWidth / 2}
          y1={cy - 6}
          x2={cx + avatar.shoulderWidth / 2 + 6}
          y2={cy + 14}
          stroke={`url(#${id}-body)`}
          strokeWidth={avatar.armWidth}
          strokeLinecap="round"
        />

        {/* Hands */}
        <circle cx={cx - avatar.shoulderWidth / 2 - 6} cy={cy + 15} r="2.5" fill={avatar.primaryColor} opacity="0.9" />
        <circle cx={cx + avatar.shoulderWidth / 2 + 6} cy={cy + 15} r="2.5" fill={avatar.primaryColor} opacity="0.9" />

        {/* Weapon */}
        {avatar.hasWeapon && avatar.fighterType === "berserker" && (
          <g filter={`url(#${id}-glow)`}>
            <line
              x1={cx + avatar.shoulderWidth / 2 + 6}
              y1={cy + 12}
              x2={cx + avatar.shoulderWidth / 2 + 20}
              y2={cy - 10}
              stroke={avatar.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polygon
              points={`${cx + avatar.shoulderWidth / 2 + 18},${cy - 8} ${cx + avatar.shoulderWidth / 2 + 22},${cy - 12} ${cx + avatar.shoulderWidth / 2 + 20},${cy - 16}`}
              fill={avatar.accentColor}
              opacity="0.8"
            />
          </g>
        )}

        {/* Staff for sage */}
        {avatar.hasWeapon && avatar.fighterType === "sage" && (
          <g filter={`url(#${id}-glow)`}>
            <line
              x1={cx + avatar.shoulderWidth / 2 + 6}
              y1={cy + 18}
              x2={cx + avatar.shoulderWidth / 2 + 4}
              y2={cy - 18}
              stroke={avatar.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.circle
              cx={cx + avatar.shoulderWidth / 2 + 4}
              cy={cy - 20}
              r="4"
              fill={avatar.accentColor}
              opacity="0.6"
              animate={{ opacity: [0.4, 0.8, 0.4], r: [3.5, 4.5, 3.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </g>
        )}

        {/* Shield for guardian */}
        {avatar.fighterType === "guardian" && (
          <g>
            <path
              d={`M${cx - avatar.shoulderWidth / 2 - 8},${cy - 2}
                  L${cx - avatar.shoulderWidth / 2 - 16},${cy + 2}
                  L${cx - avatar.shoulderWidth / 2 - 16},${cy + 12}
                  Q${cx - avatar.shoulderWidth / 2 - 12},${cy + 18} ${cx - avatar.shoulderWidth / 2 - 8},${cy + 14}
                  Z`}
              fill={avatar.secondaryColor}
              opacity="0.7"
              stroke={avatar.accentColor}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          </g>
        )}

        {/* Daggers for assassin */}
        {avatar.hasWeapon && avatar.fighterType === "assassin" && (
          <g filter={`url(#${id}-glow)`}>
            <line
              x1={cx - avatar.shoulderWidth / 2 - 6}
              y1={cy + 14}
              x2={cx - avatar.shoulderWidth / 2 - 12}
              y2={cy + 4}
              stroke={avatar.accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1={cx + avatar.shoulderWidth / 2 + 6}
              y1={cy + 14}
              x2={cx + avatar.shoulderWidth / 2 + 12}
              y2={cy + 4}
              stroke={avatar.accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Neck */}
        <rect x={cx - 3} y={cy - 16} width="6" height="5" rx="2" fill={avatar.primaryColor} opacity="0.7" />

        {/* Head */}
        <circle
          cx={cx}
          cy={cy - 22}
          r={avatar.headSize}
          fill={`url(#${id}-body)`}
          opacity="0.9"
          stroke={avatar.accentColor}
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />

        {/* Helmet */}
        {avatar.hasHelmet && (
          <>
            <path
              d={`M${cx - avatar.headSize},${cy - 22}
                  Q${cx - avatar.headSize},${cy - 22 - avatar.headSize * 1.3} ${cx},${cy - 22 - avatar.headSize * 1.3}
                  Q${cx + avatar.headSize},${cy - 22 - avatar.headSize * 1.3} ${cx + avatar.headSize},${cy - 22}
                  Z`}
              fill={avatar.secondaryColor}
              opacity="0.6"
              stroke={avatar.accentColor}
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            {/* Helmet crest */}
            <line
              x1={cx}
              y1={cy - 22 - avatar.headSize * 1.5}
              x2={cx}
              y2={cy - 22 - avatar.headSize * 0.8}
              stroke={avatar.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </>
        )}

        {/* Eyes */}
        {avatar.eyeStyle === 0 && (
          <>
            <motion.circle cx={cx - 4} cy={cy - 23} r="1.8" fill={avatar.accentColor}
              animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx={cx + 4} cy={cy - 23} r="1.8" fill={avatar.accentColor}
              animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
          </>
        )}
        {avatar.eyeStyle === 1 && (
          <>
            <rect x={cx - 6} y={cy - 24.5} width="4" height="2" rx="0.5" fill={avatar.accentColor} opacity="0.9" />
            <rect x={cx + 2} y={cy - 24.5} width="4" height="2" rx="0.5" fill={avatar.accentColor} opacity="0.9" />
          </>
        )}
        {avatar.eyeStyle === 2 && (
          <>
            <motion.line x1={cx - 6} y1={cy - 24} x2={cx - 2} y2={cy - 22} stroke={avatar.accentColor} strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.line x1={cx + 2} y1={cy - 22} x2={cx + 6} y2={cy - 24} stroke={avatar.accentColor} strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} />
          </>
        )}
        {avatar.eyeStyle === 3 && (
          <>
            <motion.circle cx={cx - 4} cy={cy - 23} r="2.5" fill="none" stroke={avatar.accentColor} strokeWidth="1"
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle cx={cx - 4} cy={cy - 23} r="1" fill={avatar.accentColor} opacity="0.9" />
            <motion.circle cx={cx + 4} cy={cy - 23} r="2.5" fill="none" stroke={avatar.accentColor} strokeWidth="1"
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle cx={cx + 4} cy={cy - 23} r="1" fill={avatar.accentColor} opacity="0.9" />
          </>
        )}

        {/* Energy particles around fighter */}
        {animate && (
          <>
            <motion.circle
              cx={cx - 20}
              cy={cy - 10}
              r="1"
              fill={avatar.accentColor}
              animate={{ cy: [cy - 10, cy - 25], opacity: [0, 0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx={cx + 18}
              cy={cy}
              r="0.8"
              fill={avatar.primaryColor}
              animate={{ cy: [cy, cy - 15], opacity: [0, 0.6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
            />
            <motion.circle
              cx={cx - 10}
              cy={cy + 5}
              r="1.2"
              fill={avatar.secondaryColor}
              animate={{ cy: [cy + 5, cy - 10], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
            />
          </>
        )}

        {/* Ground shadow */}
        <ellipse cx={cx} cy={cy + 10 + avatar.legLength + 3} rx="14" ry="3" fill="black" opacity="0.3" />
      </svg>

      {/* Glow ring border */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 15px ${borderColor}40, inset 0 0 15px ${borderColor}20`,
          borderRadius: "50%",
        }}
      />
    </motion.div>
  )
}
