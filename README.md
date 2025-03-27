# OneArena

**AI-powered NFT battle arena on OneChain**

OneArena is a fully on-chain fighting game where players mint unique Fighter NFTs with randomized stats, battle other fighters using an AI-driven combat engine, and climb the global leaderboard. Built for OneHack 3.0.

## Live Deployment

| Detail | Value |
|--------|-------|
| **Network** | OneChain Testnet |
| **RPC** | `https://rpc-testnet.onelabs.cc:443` |
| **Package ID** | `0x9a01a42b270ae9d1829f15334b5e74bc2e6c9ebbaa776b4186ca53880752ecf8` |
| **Tx Digest** | `3i8Ue5Va249pzBU8Por9nN6hw1ghJT8WK8PFhHi8JynB` |

## Features

- **Mint Fighter NFTs** with randomized DNA-based stats (attack, defense, speed, intelligence, stamina)
- **AI Battle Engine** with turn-based combat, move triangle (Attack > Special > Defend > Attack), critical hits, and dramatic narration
- **On-chain Battles** with verifiable randomness via `sui::random`
- **Global Leaderboard** tracking top 100 fighters by wins
- **XP and Leveling** system (max level 50) with stat growth per level
- **Strategy AI** that analyzes matchups and recommends optimal moves
- **Fighter Analysis** with tier ratings, strengths/weaknesses, and evolution advice

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | OneChain (Sui-based L1) |
| **Smart Contracts** | Sui Move (3 modules, 729 lines) |
| **Frontend** | Next.js 15, React 19, TailwindCSS 4 |
| **Wallet** | @onelabs/dapp-kit + OneChain Wallet |
| **AI Engine** | Custom TypeScript battle simulator (744 lines) |
| **UI Components** | Radix UI, Framer Motion, Lucide Icons |

## Project Structure

```
onearena/
├── app/                    # Next.js pages
│   ├── page.tsx            # Landing page (hero, features, stats)
│   ├── mint/page.tsx       # Mint new fighter NFT
│   ├── battle/page.tsx     # Battle arena with AI narration
│   ├── fighters/page.tsx   # Fighter collection grid
│   ├── leaderboard/page.tsx # Global leaderboard
│   └── api/                # API routes
│       ├── battle/         # POST /api/battle - simulate battle
│       ├── strategy/       # POST /api/strategy - get matchup advice
│       └── fighter/        # POST /api/fighter/analyze - analyze stats
├── components/             # React components
│   ├── battle-arena.tsx    # Battle UI with round-by-round animation
│   ├── fighter-card.tsx    # NFT card with stats display
│   ├── header.tsx          # Navigation header
│   └── onechain-provider.tsx # Wallet provider wrapper
├── contract/               # Sui Move smart contracts
│   └── sources/
│       ├── fighter.move    # Fighter NFT (mint, level up, stats)
│       ├── battle.move     # On-chain battle logic
│       ├── leaderboard.move # Top 100 leaderboard
│       └── leaderboard_tests.move
├── lib/
│   └── ai-engine.ts       # AI battle engine (BattleEngine, StrategyGenerator, FighterAnalyzer)
└── scripts/
    ├── deploy.ts           # Contract deployment script
    └── test-battle.ts      # Battle engine test
```

## Smart Contracts

### fighter.move
- `mint_fighter()` creates a Fighter NFT with random DNA using `sui::random`
- DNA encodes 5 base stats: attack, defense, speed, intelligence, stamina (range 10-99)
- `add_xp()` and `level_up()` for progression (max level 50)
- Stats grow by +2 per level up
- Emits `FighterMinted` and `FighterLeveledUp` events

### battle.move
- `battle()` runs on-chain combat between two fighters
- Speed determines initiative (faster fighter attacks first)
- Damage formula: `attack * 0.4 - defense * 0.3 + speed * 0.05`
- Random variance (0.85x to 1.15x) and critical hits (10% chance, 1.5x damage)
- Winners gain 50 XP, losers gain 20 XP
- Auto-updates the leaderboard after each battle

### leaderboard.move
- Shared object tracking top 100 fighters
- Sorted by total wins (descending)
- `update_leaderboard()` called after each battle
- Admin cap for leaderboard reset

## AI Battle Engine

The off-chain AI engine (`lib/ai-engine.ts`) provides:

- **BattleEngine**: Deterministic battle simulation with move triangle
  - Attack beats Special, Special beats Defend, Defend beats Attack
  - Speed-based turn priority, critical hits, damage variance
  - Round-by-round HP tracking and dramatic narration
- **StrategyGenerator**: Analyzes stat matchups and recommends moves with win probability
- **FighterAnalyzer**: Rates fighters (S/A/B/C/D tier), identifies strengths/weaknesses
- **EvolutionAdvisor**: Suggests 3 build paths based on current stats

Works 100% without API keys (deterministic mode). Optional OpenAI integration for enhanced narration.

## API Routes

### POST /api/battle
Simulate a full battle between two fighters.
```json
{
  "fighter1": { "name": "FireDragon", "attack": 85, "defense": 70, ... },
  "fighter2": { "name": "IceGolem", "attack": 60, "defense": 95, ... }
}
```
Returns: winner, rounds array, narration, dominance score.

### POST /api/strategy
Get matchup strategy advice.
```json
{
  "fighter": { ... },
  "opponent": { ... }
}
```
Returns: recommended move, win probability, analysis.

### POST /api/fighter/analyze
Analyze a fighter's stats.
```json
{
  "fighter": { "name": "FireDragon", "attack": 85, ... }
}
```
Returns: tier rating, strengths, weaknesses, training focus, evolution paths.

## Getting Started

### Prerequisites
- Node.js 20+
- Sui CLI (for contract compilation)
- OneChain Wallet browser extension

### Install and Run
```bash
npm install
npm run dev
```
App runs at `http://localhost:3000`

### Deploy Contracts
```bash
npm run deploy
```
Deploys all 3 Move modules to OneChain testnet. Requires ONE tokens from the [testnet faucet](https://faucet-testnet.onelabs.cc).

### Test Battle Engine
```bash
npm run test:battle
```

## How to Play

1. **Connect Wallet** using OneChain Wallet
2. **Mint a Fighter** with randomized stats
3. **Battle** other fighters in the arena (AI narrates each round)
4. **Level Up** your fighter with XP earned from battles
5. **Climb the Leaderboard** to become the top fighter

## Built For

**OneHack 3.0** hackathon, showcasing:
- On-chain gaming with verifiable randomness
- AI-enhanced gameplay (strategy, narration, analysis)
- OneChain ecosystem integration (@onelabs/dapp-kit, @onelabs/sui)
- Full-stack dApp: smart contracts + frontend + AI engine
