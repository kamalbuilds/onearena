"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { LightningIcon } from "@/components/ui/game-icons"
import { useState } from "react"
import { ConnectButton } from "@onelabs/dapp-kit"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/mint", label: "Mint" },
    { href: "/battle", label: "Battle" },
    { href: "/fighters", label: "My Fighters" },
    { href: "/leaderboard", label: "Leaderboard" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
            >
              <LightningIcon size={28} className="text-cyan-400 inline-block" glow /> OneArena
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-3 border-t border-cyan-900"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <ConnectButton />
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
