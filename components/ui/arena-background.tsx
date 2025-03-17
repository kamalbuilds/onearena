"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ArenaBackgroundProps {
  active?: boolean
  intensity?: "low" | "medium" | "high"
  className?: string
}

export default function ArenaBackground({
  active = false,
  intensity = "medium",
  className = "",
}: ArenaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()

    const particleCount = intensity === "high" ? 80 : intensity === "medium" ? 50 : 25

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      hue: number
      life: number
      maxLife: number
    }

    const particles: Particle[] = []
    const w = () => canvas.offsetWidth
    const h = () => canvas.offsetHeight

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.7,
        size: 1 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.4,
        hue: Math.random() > 0.5 ? 185 : 270,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      })
    }

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, w(), h())
      time += 0.016

      // Draw hex grid
      ctx.strokeStyle = active ? "rgba(0, 240, 255, 0.06)" : "rgba(0, 240, 255, 0.03)"
      ctx.lineWidth = 0.5
      const gridSize = 40
      for (let x = 0; x < w() + gridSize; x += gridSize) {
        for (let y = 0; y < h() + gridSize; y += gridSize * 0.866) {
          const offsetX = (Math.floor(y / (gridSize * 0.866)) % 2) * (gridSize / 2)
          drawHexagon(ctx, x + offsetX, y, gridSize / 2)
        }
      }

      // Draw energy lines
      if (active) {
        const lineCount = intensity === "high" ? 6 : 3
        for (let i = 0; i < lineCount; i++) {
          const progress = ((time * 0.3 + i * 0.3) % 1)
          ctx.beginPath()
          ctx.strokeStyle = `hsla(185, 100%, 60%, ${0.1 * (1 - progress)})`
          ctx.lineWidth = 1
          const yPos = h() * progress
          ctx.moveTo(0, yPos)
          ctx.lineTo(w(), yPos)
          ctx.stroke()
        }
      }

      // Update and draw particles
      for (const p of particles) {
        p.life++
        if (p.life > p.maxLife) {
          p.x = Math.random() * w()
          p.y = h() + 10
          p.life = 0
          p.opacity = 0.1 + Math.random() * 0.4
        }

        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.3
        p.y += p.vy * (active ? 1.5 : 1)

        if (p.y < -10) {
          p.y = h() + 10
          p.x = Math.random() * w()
        }

        const fadeIn = Math.min(p.life / 20, 1)
        const fadeOut = Math.max(0, 1 - (p.life - p.maxLife + 30) / 30)
        const alpha = p.opacity * fadeIn * fadeOut * (active ? 1.2 : 0.8)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`
        ctx.fill()

        // Glow
        if (alpha > 0.2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha * 0.15})`
          ctx.fill()
        }
      }

      // Corner energy effects when active
      if (active) {
        const cornerGlow = Math.sin(time * 2) * 0.5 + 0.5
        const gradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
        gradient1.addColorStop(0, `rgba(0, 240, 255, ${0.08 * cornerGlow})`)
        gradient1.addColorStop(1, "transparent")
        ctx.fillStyle = gradient1
        ctx.fillRect(0, 0, 150, 150)

        const gradient2 = ctx.createRadialGradient(w(), h(), 0, w(), h(), 150)
        gradient2.addColorStop(0, `rgba(128, 0, 255, ${0.08 * cornerGlow})`)
        gradient2.addColorStop(1, "transparent")
        ctx.fillStyle = gradient2
        ctx.fillRect(w() - 150, h() - 150, 150, 150)
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [active, intensity])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(10, 0, 21, 0.6) 100%)",
        }}
      />

      {/* Top/bottom gradient bars */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, transparent, #00f0ff40, transparent)" }}
        animate={active ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.2 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, transparent, #7c3aed40, transparent)" }}
        animate={active ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.2 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
      />
    </div>
  )
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const px = x + r * Math.cos(angle)
    const py = y + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.stroke()
}
