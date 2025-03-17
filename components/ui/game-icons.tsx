"use client"

interface IconProps {
  size?: number
  className?: string
  glow?: boolean
}

// Attack / Sword icon
export function SwordIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M44 4L20 28L16 24L8 32L16 40L24 32L20 28L44 4Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M52 4L48 8L56 16L60 12L52 4Z"
        fill="currentColor"
        opacity="0.3"
      />
      <line x1="14" y1="50" x2="50" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="14" x2="58" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="58,2 62,6 58,10 54,6" fill="currentColor" opacity="0.9" />
      <line x1="20" y1="36" x2="28" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="40" x2="24" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="54" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// Defense / Shield icon
export function ShieldIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M32 4L8 16V32C8 48 32 60 32 60C32 60 56 48 56 32V16L32 4Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 12L14 22V32C14 44 32 54 32 54C32 54 50 44 50 32V22L32 12Z"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeDasharray="4 3"
      />
      <path
        d="M32 20V48"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M20 28H44"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </svg>
  )
}

// Speed / Lightning icon
export function LightningIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <polygon
        points="36,2 12,36 28,36 24,62 52,24 34,24"
        fill="currentColor"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        points="34,8 16,34 28,34 25,56 48,26 35,26"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  )
}

// Intelligence / Brain icon
export function BrainIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M32 56V32"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Left hemisphere */}
      <path
        d="M32 32C32 32 28 28 20 28C12 28 8 34 8 40C8 46 12 52 20 52C24 52 28 50 32 46"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 28C20 28 16 24 16 18C16 12 20 8 28 8C32 8 32 12 32 12"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right hemisphere */}
      <path
        d="M32 32C32 32 36 28 44 28C52 28 56 34 56 40C56 46 52 52 44 52C40 52 36 50 32 46"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M44 28C44 28 48 24 48 18C48 12 44 8 36 8C32 8 32 12 32 12"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Neural connections */}
      <circle cx="20" cy="38" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="44" cy="38" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="28" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="36" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <line x1="20" y1="38" x2="28" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="44" y1="38" x2="36" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

// Heart / HP icon
export function HeartIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M32 56L8 32C4 28 2 22 4 16C6 10 12 6 18 6C22 6 26 8 32 14C38 8 42 6 46 6C52 6 58 10 60 16C62 22 60 28 56 32L32 56Z"
        fill="currentColor"
        opacity="0.25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Trophy icon
export function TrophyIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M18 8H46V24C46 34 40 42 32 42C24 42 18 34 18 24V8Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M18 14H8C8 14 6 24 14 28L18 24" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <path d="M46 14H56C56 14 58 24 50 28L46 24" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <line x1="32" y1="42" x2="32" y2="50" stroke="currentColor" strokeWidth="2.5" />
      <rect x="22" y="50" width="20" height="6" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="22" r="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

// Crossed swords / Battle icon
export function CrossedSwordsIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <line x1="10" y1="54" x2="46" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="46,6 50,10 46,14 42,10" fill="currentColor" opacity="0.8" />
      <line x1="14" y1="46" x2="22" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="50" x2="14" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      <line x1="54" y1="54" x2="18" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="18,6 14,10 18,14 22,10" fill="currentColor" opacity="0.8" />
      <line x1="50" y1="46" x2="42" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="50" x2="50" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Sparkle / Special move icon
export function SparkleIcon({ size = 24, className = "", glow = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px currentColor)" } : undefined}
    >
      <path
        d="M32 4L36 24L56 20L40 32L56 44L36 40L32 60L28 40L8 44L24 32L8 20L28 24L32 4Z"
        fill="currentColor"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
