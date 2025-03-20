// ============================================================
// OneArena AI Battle Engine
// Full battle simulation, strategy, narration, analysis, evolution
// ============================================================

export interface Fighter {
  id: string;
  name: string;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  hp: number;
  currentHp?: number;
  level?: number;
}

export interface BattleHistoryEntry {
  round: number;
  myMove: number;
  opponentMove: number;
  myDamage: number;
  opponentDamage: number;
}

export interface BattleStrategy {
  move: number; // 0=attack, 1=defend, 2=special
  reasoning: string;
  winProbability: number;
}

export interface BattleRound {
  round: number;
  fighter1Move: number;
  fighter2Move: number;
  fighter1Damage: number;
  fighter2Damage: number;
  fighter1Hp: number;
  fighter2Hp: number;
  narration: string;
  critical: boolean;
}

export interface BattleResult {
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  rounds: BattleRound[];
  totalRounds: number;
  finalNarration: string;
  fighter1FinalHp: number;
  fighter2FinalHp: number;
  xpReward: number;
  dominanceScore: number; // 0-100, how dominant the win was
}

export interface FighterAnalysis {
  overallRating: number; // 1-100
  tier: string; // S, A, B, C, D
  strengths: string[];
  weaknesses: string[];
  bestStrategy: string;
  trainingFocus: string;
  synergyScore: number;
  threatLevel: string;
}

export interface EvolutionAdvice {
  recommendedUpgrades: { stat: string; points: number; reason: string }[];
  buildPath: string;
  buildDescription: string;
  projectedTier: string;
}

const MOVE_NAMES = ['Attack', 'Defend', 'Special'];
const MOVE_ADVANTAGE: Record<number, number> = {
  0: 2, // attack beats special
  1: 0, // defend beats attack
  2: 1, // special beats defend
};

// ============================================================
// Core Calculations
// ============================================================

function calculateMoveAdvantage(myMove: number, opponentMove: number): number {
  if (MOVE_ADVANTAGE[myMove] === opponentMove) return 1.5;
  if (MOVE_ADVANTAGE[opponentMove] === myMove) return 0.67;
  return 1.0;
}

function calculateStatDominance(a: Fighter, b: Fighter) {
  return {
    attackDominance: (a.attack - b.attack) / Math.max(b.attack, 1),
    defenseDominance: (a.defense - b.defense) / Math.max(b.defense, 1),
    speedDominance: (a.speed - b.speed) / Math.max(b.speed, 1),
    intelligenceDominance: ((a.intelligence || 50) - (b.intelligence || 50)) / Math.max(b.intelligence || 50, 1),
  };
}

function analyzeHistoricalPatterns(battleHistory: BattleHistoryEntry[]) {
  if (battleHistory.length === 0) {
    return {
      opponentAttackFrequency: 0.33,
      opponentDefendFrequency: 0.33,
      opponentSpecialFrequency: 0.33,
      opponentPreferredMove: Math.floor(Math.random() * 3),
    };
  }
  const moveCounts = [0, 0, 0];
  battleHistory.forEach((e) => moveCounts[e.opponentMove]++);
  const total = battleHistory.length;
  return {
    opponentAttackFrequency: moveCounts[0] / total,
    opponentDefendFrequency: moveCounts[1] / total,
    opponentSpecialFrequency: moveCounts[2] / total,
    opponentPreferredMove: moveCounts.indexOf(Math.max(...moveCounts)),
  };
}

function calculateWinProbability(a: Fighter, b: Fighter): number {
  const d = calculateStatDominance(a, b);
  const rawScore = d.attackDominance * 0.4 + d.defenseDominance * 0.3 + d.speedDominance * 0.15 + d.intelligenceDominance * 0.15;
  return Math.max(0.15, Math.min(0.85, 0.5 + Math.tanh(rawScore) * 0.3));
}

// ============================================================
// Strategy Generation (Deterministic)
// ============================================================

export function generateBattleStrategy(
  myFighter: Fighter,
  opponentFighter: Fighter,
  battleHistory?: BattleHistoryEntry[],
): BattleStrategy {
  const history = battleHistory || [];
  const statDominance = calculateStatDominance(myFighter, opponentFighter);
  const historicalPatterns = analyzeHistoricalPatterns(history);
  const winProb = calculateWinProbability(myFighter, opponentFighter);

  let recommendedMove: number;
  let reasoning: string;

  if (history.length > 0) {
    const opponentPreferredMove = historicalPatterns.opponentPreferredMove;
    const counterMove = MOVE_ADVANTAGE[opponentPreferredMove];
    recommendedMove = counterMove;
    reasoning = `Opponent favors ${MOVE_NAMES[opponentPreferredMove]}, countering with ${MOVE_NAMES[counterMove]}.`;
  } else if (statDominance.attackDominance > 0.2) {
    recommendedMove = 0;
    reasoning = 'Superior attack stat. Recommending aggressive strategy.';
  } else if (statDominance.defenseDominance > 0.2) {
    recommendedMove = 1;
    reasoning = 'Superior defense stat. Recommending defensive strategy.';
  } else if (statDominance.speedDominance > 0.2) {
    recommendedMove = 2;
    reasoning = 'Superior speed and intelligence. Special move recommended.';
  } else if (statDominance.attackDominance > 0) {
    recommendedMove = 0;
    reasoning = 'Slight attack advantage. Cautious attack strategy.';
  } else if (statDominance.defenseDominance > 0) {
    recommendedMove = 1;
    reasoning = 'Slight defense advantage. Defensive positioning.';
  } else {
    const random = Math.random();
    recommendedMove = random < 0.4 ? 0 : random < 0.7 ? 1 : 2;
    reasoning = 'Evenly matched fighters. Using balanced strategy.';
  }

  return { move: recommendedMove, reasoning, winProbability: winProb };
}

// ============================================================
// AI-Powered Strategy (OpenAI)
// ============================================================

export async function generateBattleStrategyWithAI(
  myFighter: Fighter,
  opponentFighter: Fighter,
  battleHistory?: BattleHistoryEntry[],
): Promise<BattleStrategy> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generateBattleStrategy(myFighter, opponentFighter, battleHistory);

  try {
    const prompt = `You are an expert battle strategy AI. Analyze these fighters and recommend the best move.

My Fighter: ${myFighter.name} (ATK:${myFighter.attack} DEF:${myFighter.defense} SPD:${myFighter.speed} INT:${myFighter.intelligence} HP:${myFighter.currentHp || myFighter.hp})
Opponent: ${opponentFighter.name} (ATK:${opponentFighter.attack} DEF:${opponentFighter.defense} SPD:${opponentFighter.speed} INT:${opponentFighter.intelligence} HP:${opponentFighter.currentHp || opponentFighter.hp})

Moves: 0=Attack (beats Special), 1=Defend (beats Attack), 2=Special (beats Defend)

${battleHistory?.length ? `Recent history:\n${battleHistory.slice(-5).map((e) => `R${e.round}: I=${MOVE_NAMES[e.myMove]}, Opp=${MOVE_NAMES[e.opponentMove]}`).join('\n')}` : 'No history.'}

Respond ONLY with JSON: {"move": <0|1|2>, "reasoning": "<brief>", "winProbability": <0.0-1.0>}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) return generateBattleStrategy(myFighter, opponentFighter, battleHistory);

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return generateBattleStrategy(myFighter, opponentFighter, battleHistory);

    const parsed = JSON.parse(jsonMatch[0]) as BattleStrategy;
    if (![0, 1, 2].includes(parsed.move)) parsed.move = generateBattleStrategy(myFighter, opponentFighter, battleHistory).move;
    if (typeof parsed.winProbability !== 'number' || parsed.winProbability < 0 || parsed.winProbability > 1) {
      parsed.winProbability = calculateWinProbability(myFighter, opponentFighter);
    }
    if (typeof parsed.reasoning !== 'string') parsed.reasoning = 'AI-powered strategy recommendation.';
    return parsed;
  } catch {
    return generateBattleStrategy(myFighter, opponentFighter, battleHistory);
  }
}

// ============================================================
// Battle Simulation Engine
// ============================================================

function pickAIMove(fighter: Fighter, opponent: Fighter, history: BattleRound[], fighterIndex: 1 | 2): number {
  // AI uses weighted random based on stats + pattern recognition
  const d = calculateStatDominance(fighter, opponent);

  // Check opponent's last moves for pattern
  if (history.length >= 2) {
    const lastMoves = history.slice(-3).map((r) => (fighterIndex === 1 ? r.fighter2Move : r.fighter1Move));
    const counts = [0, 0, 0];
    lastMoves.forEach((m) => counts[m]++);
    const predicted = counts.indexOf(Math.max(...counts));
    // 40% chance to counter the predicted move
    if (Math.random() < 0.4) return MOVE_ADVANTAGE[predicted];
  }

  // Stat-weighted move selection
  const attackWeight = 0.33 + d.attackDominance * 0.2;
  const defendWeight = 0.33 + d.defenseDominance * 0.2;
  const roll = Math.random();
  if (roll < attackWeight) return 0;
  if (roll < attackWeight + defendWeight) return 1;
  return 2;
}

function calculateDamage(
  attacker: Fighter,
  defender: Fighter,
  attackerMove: number,
  defenderMove: number,
): { damage: number; critical: boolean } {
  const advantage = calculateMoveAdvantage(attackerMove, defenderMove);

  const atkInt = attacker.intelligence || attacker.attack; // fallback if intelligence missing
  let baseDamage: number;
  if (attackerMove === 0) {
    baseDamage = attacker.attack * 0.4 - defender.defense * 0.2;
  } else if (attackerMove === 2) {
    baseDamage = (attacker.attack * 0.25 + atkInt * 0.25) - defender.defense * 0.15;
  } else {
    // Defend: small counter damage
    baseDamage = attacker.defense * 0.1;
  }

  // Speed gives slight damage bonus
  baseDamage += (attacker.speed || 50) * 0.02;

  // Critical hit: intelligence-based chance
  const critChance = Math.min(0.25, (attacker.intelligence || 50) / 400);
  const critical = Math.random() < critChance;
  if (critical) baseDamage *= 1.5;

  // Apply advantage multiplier
  baseDamage *= advantage;

  // Variance +/- 10%
  baseDamage *= 0.9 + Math.random() * 0.2;

  return { damage: Math.max(1, Math.round(baseDamage)), critical };
}

// ============================================================
// Narration Engine
// ============================================================

const ATTACK_NARRATIONS = [
  (a: string, d: string, dmg: number) => `${a} lunges forward with a devastating strike, dealing ${dmg} damage to ${d}!`,
  (a: string, d: string, dmg: number) => `${a} unleashes a furious combo, ${d} staggers back taking ${dmg} damage!`,
  (a: string, d: string, dmg: number) => `A lightning-fast punch from ${a} connects! ${d} absorbs ${dmg} damage!`,
  (a: string, d: string, dmg: number) => `${a} charges in relentlessly, hammering ${d} for ${dmg} damage!`,
  (a: string, d: string, dmg: number) => `With raw power, ${a} slams into ${d}! ${dmg} damage dealt!`,
];

const DEFEND_NARRATIONS = [
  (a: string, _d: string, dmg: number) => `${a} raises their guard, deflecting the blow and countering for ${dmg}!`,
  (a: string, _d: string, dmg: number) => `${a} reads the attack perfectly, parrying with a ${dmg}-damage riposte!`,
  (a: string, _d: string, dmg: number) => `Iron-willed defense from ${a}! They absorb the hit and strike back for ${dmg}!`,
];

const SPECIAL_NARRATIONS = [
  (a: string, d: string, dmg: number) => `${a} channels their inner power, unleashing a special blast for ${dmg} damage on ${d}!`,
  (a: string, d: string, dmg: number) => `Energy crackles as ${a} executes their signature move! ${d} takes ${dmg} damage!`,
  (a: string, d: string, dmg: number) => `${a}'s eyes glow with power. A devastating special attack hits ${d} for ${dmg}!`,
  (a: string, d: string, dmg: number) => `The arena trembles as ${a} releases a wave of energy, ${d} takes ${dmg} damage!`,
];

const CRITICAL_ADDITIONS = [
  'CRITICAL HIT! ',
  'A devastating critical blow! ',
  'The crowd goes wild, CRITICAL! ',
];

const ADVANTAGE_ADDITIONS = [
  'Type advantage kicks in! ',
  'Perfect counter-play! ',
  'The move triangle favors the attacker! ',
];

function narrateMove(attackerName: string, defenderName: string, move: number, damage: number, critical: boolean, advantage: boolean): string {
  let pool: ((a: string, d: string, dmg: number) => string)[];
  if (move === 0) pool = ATTACK_NARRATIONS;
  else if (move === 1) pool = DEFEND_NARRATIONS;
  else pool = SPECIAL_NARRATIONS;

  let narration = pool[Math.floor(Math.random() * pool.length)](attackerName, defenderName, damage);

  if (critical) narration = CRITICAL_ADDITIONS[Math.floor(Math.random() * CRITICAL_ADDITIONS.length)] + narration;
  if (advantage) narration = ADVANTAGE_ADDITIONS[Math.floor(Math.random() * ADVANTAGE_ADDITIONS.length)] + narration;

  return narration;
}

function narrateRound(round: BattleRound, f1Name: string, f2Name: string): string {
  const f1Advantage = MOVE_ADVANTAGE[round.fighter1Move] === round.fighter2Move;
  const f2Advantage = MOVE_ADVANTAGE[round.fighter2Move] === round.fighter1Move;

  // Faster fighter acts first
  const f1Narration = narrateMove(f1Name, f2Name, round.fighter1Move, round.fighter1Damage, round.critical, f1Advantage);
  const f2Narration = narrateMove(f2Name, f1Name, round.fighter2Move, round.fighter2Damage, false, f2Advantage);

  return `[Round ${round.round}] ${f1Narration} ${f2Narration} [HP: ${f1Name} ${round.fighter1Hp} | ${f2Name} ${round.fighter2Hp}]`;
}

const FINALE_TEMPLATES = [
  (winner: string, loser: string, rounds: number) =>
    `After ${rounds} intense rounds, ${winner} stands victorious over ${loser}! The arena erupts in cheers as the champion raises their fists in triumph!`,
  (winner: string, loser: string, rounds: number) =>
    `${loser} hits the ground after ${rounds} rounds of fierce combat! ${winner} claims a hard-fought victory! What a battle!`,
  (winner: string, loser: string, rounds: number) =>
    `The dust settles after ${rounds} rounds of pure chaos. ${winner} emerges as the undisputed champion, leaving ${loser} to fight another day!`,
  (winner: string, _loser: string, rounds: number) =>
    `${rounds} rounds of absolute carnage come to an end. ${winner} is the last one standing! A legendary display of combat prowess!`,
];

export function simulateBattle(fighter1: Fighter, fighter2: Fighter): BattleResult {
  const maxRounds = 20;
  let f1Hp = fighter1.hp;
  let f2Hp = fighter2.hp;
  const rounds: BattleRound[] = [];

  for (let round = 1; round <= maxRounds; round++) {
    const f1Move = pickAIMove(fighter1, fighter2, rounds, 1);
    const f2Move = pickAIMove(fighter2, fighter1, rounds, 2);

    const f1Attack = calculateDamage(fighter1, fighter2, f1Move, f2Move);
    const f2Attack = calculateDamage(fighter2, fighter1, f2Move, f1Move);

    // Speed determines who lands first; faster fighter's kill shot ends the round
    const f1First = fighter1.speed >= fighter2.speed;

    if (f1First) {
      f2Hp -= f1Attack.damage;
      if (f2Hp <= 0) {
        f2Hp = 0;
        const battleRound: BattleRound = {
          round, fighter1Move: f1Move, fighter2Move: f2Move,
          fighter1Damage: f1Attack.damage, fighter2Damage: 0,
          fighter1Hp: f1Hp, fighter2Hp: 0,
          narration: '', critical: f1Attack.critical,
        };
        battleRound.narration = narrateRound(battleRound, fighter1.name, fighter2.name);
        rounds.push(battleRound);
        break;
      }
      f1Hp -= f2Attack.damage;
      if (f1Hp <= 0) f1Hp = 0;
    } else {
      f1Hp -= f2Attack.damage;
      if (f1Hp <= 0) {
        f1Hp = 0;
        const battleRound: BattleRound = {
          round, fighter1Move: f1Move, fighter2Move: f2Move,
          fighter1Damage: 0, fighter2Damage: f2Attack.damage,
          fighter1Hp: 0, fighter2Hp: f2Hp,
          narration: '', critical: f2Attack.critical,
        };
        battleRound.narration = narrateRound(battleRound, fighter1.name, fighter2.name);
        rounds.push(battleRound);
        break;
      }
      f2Hp -= f1Attack.damage;
      if (f2Hp <= 0) f2Hp = 0;
    }

    const battleRound: BattleRound = {
      round, fighter1Move: f1Move, fighter2Move: f2Move,
      fighter1Damage: f1Attack.damage, fighter2Damage: f2Attack.damage,
      fighter1Hp: Math.max(0, f1Hp), fighter2Hp: Math.max(0, f2Hp),
      narration: '', critical: f1Attack.critical || f2Attack.critical,
    };
    battleRound.narration = narrateRound(battleRound, fighter1.name, fighter2.name);
    rounds.push(battleRound);

    if (f1Hp <= 0 || f2Hp <= 0) break;
  }

  // Determine winner
  let winnerId: string, winnerName: string, loserId: string, loserName: string;
  if (f1Hp <= 0 && f2Hp <= 0) {
    // Both down: higher remaining wins, or fighter2 if tie
    if (f1Hp >= f2Hp) {
      winnerId = fighter1.id; winnerName = fighter1.name;
      loserId = fighter2.id; loserName = fighter2.name;
    } else {
      winnerId = fighter2.id; winnerName = fighter2.name;
      loserId = fighter1.id; loserName = fighter1.name;
    }
  } else if (f2Hp <= 0) {
    winnerId = fighter1.id; winnerName = fighter1.name;
    loserId = fighter2.id; loserName = fighter2.name;
  } else if (f1Hp <= 0) {
    winnerId = fighter2.id; winnerName = fighter2.name;
    loserId = fighter1.id; loserName = fighter1.name;
  } else {
    // Timeout: higher HP% wins
    const f1Pct = f1Hp / fighter1.hp;
    const f2Pct = f2Hp / fighter2.hp;
    if (f1Pct >= f2Pct) {
      winnerId = fighter1.id; winnerName = fighter1.name;
      loserId = fighter2.id; loserName = fighter2.name;
    } else {
      winnerId = fighter2.id; winnerName = fighter2.name;
      loserId = fighter1.id; loserName = fighter1.name;
    }
  }

  const totalRounds = rounds.length;
  const dominanceScore = Math.round(
    Math.min(100, Math.max(0,
      winnerId === fighter1.id
        ? ((f1Hp / fighter1.hp) * 50 + (1 - totalRounds / maxRounds) * 50)
        : ((f2Hp / fighter2.hp) * 50 + (1 - totalRounds / maxRounds) * 50)
    ))
  );

  const xpReward = Math.round(20 + dominanceScore * 0.8 + totalRounds * 2);

  const finalNarration = FINALE_TEMPLATES[Math.floor(Math.random() * FINALE_TEMPLATES.length)](winnerName, loserName, totalRounds);

  return {
    winnerId, winnerName, loserId, loserName,
    rounds, totalRounds, finalNarration,
    fighter1FinalHp: Math.max(0, f1Hp),
    fighter2FinalHp: Math.max(0, f2Hp),
    xpReward, dominanceScore,
  };
}

// ============================================================
// AI-Narrated Battle (OpenAI enhanced)
// ============================================================

export async function simulateBattleWithAI(fighter1: Fighter, fighter2: Fighter): Promise<BattleResult> {
  const result = simulateBattle(fighter1, fighter2);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return result;

  try {
    const roundSummary = result.rounds.map((r) =>
      `R${r.round}: ${fighter1.name} uses ${MOVE_NAMES[r.fighter1Move]} (${r.fighter1Damage}dmg), ${fighter2.name} uses ${MOVE_NAMES[r.fighter2Move]} (${r.fighter2Damage}dmg). HP: ${r.fighter1Hp}/${r.fighter2Hp}${r.critical ? ' [CRIT]' : ''}`
    ).join('\n');

    const prompt = `You are a legendary battle commentator for an anime fighting game. Write exciting play-by-play narration for this battle. Be dramatic, use vivid language, make it feel like a real fight.

${fighter1.name} (ATK:${fighter1.attack} DEF:${fighter1.defense} SPD:${fighter1.speed} INT:${fighter1.intelligence})
vs
${fighter2.name} (ATK:${fighter2.attack} DEF:${fighter2.defense} SPD:${fighter2.speed} INT:${fighter2.intelligence})

Battle data:
${roundSummary}

Winner: ${result.winnerName}

Write a JSON array of narration strings, one per round, plus a final victory narration. Keep each round narration to 1-2 sentences. Make it exciting!
{"rounds": ["round 1 narration", ...], "finale": "victory narration"}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) return result;

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return result;

    const parsed = JSON.parse(jsonMatch[0]) as { rounds: string[]; finale: string };
    if (Array.isArray(parsed.rounds)) {
      parsed.rounds.forEach((narration, i) => {
        if (result.rounds[i] && typeof narration === 'string') {
          result.rounds[i].narration = narration;
        }
      });
    }
    if (typeof parsed.finale === 'string') {
      result.finalNarration = parsed.finale;
    }

    return result;
  } catch {
    return result;
  }
}

// ============================================================
// Fighter Analysis
// ============================================================

export function analyzeFighter(fighter: Fighter): FighterAnalysis {
  const totalStats = fighter.attack + fighter.defense + fighter.speed + fighter.intelligence;
  const maxPossible = 400; // 4 stats * 100 max
  const overallRating = Math.round((totalStats / maxPossible) * 100);

  let tier: string;
  if (overallRating >= 85) tier = 'S';
  else if (overallRating >= 70) tier = 'A';
  else if (overallRating >= 55) tier = 'B';
  else if (overallRating >= 40) tier = 'C';
  else tier = 'D';

  const stats = [
    { name: 'Attack', value: fighter.attack },
    { name: 'Defense', value: fighter.defense },
    { name: 'Speed', value: fighter.speed },
    { name: 'Intelligence', value: fighter.intelligence },
  ];
  const sorted = [...stats].sort((a, b) => b.value - a.value);
  const avg = totalStats / 4;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  sorted.forEach((s) => {
    if (s.value >= avg * 1.15) {
      strengths.push(`High ${s.name} (${s.value}): gives advantage in ${s.name === 'Attack' ? 'direct combat' : s.name === 'Defense' ? 'survivability' : s.name === 'Speed' ? 'turn priority and evasion' : 'special moves and critical hits'}`);
    }
    if (s.value < avg * 0.85) {
      weaknesses.push(`Low ${s.name} (${s.value}): vulnerable to ${s.name === 'Attack' ? 'drawn-out fights' : s.name === 'Defense' ? 'aggressive opponents' : s.name === 'Speed' ? 'fast attackers' : 'special-heavy fighters'}`);
    }
  });

  if (strengths.length === 0) strengths.push('Well-rounded stats with no major gaps');
  if (weaknesses.length === 0) weaknesses.push('No critical weaknesses found');

  let bestStrategy: string;
  if (fighter.attack >= fighter.defense && fighter.attack >= fighter.speed) {
    bestStrategy = 'Aggressive: Lead with Attack moves to maximize damage output. Your raw power will overwhelm most opponents.';
  } else if (fighter.defense >= fighter.attack && fighter.defense >= fighter.speed) {
    bestStrategy = 'Defensive: Use Defend to counter aggressive opponents, then strike when they overcommit.';
  } else if (fighter.speed >= fighter.attack) {
    bestStrategy = 'Tactical: Use your speed advantage to act first. Mix Special moves with counters to keep opponents guessing.';
  } else {
    bestStrategy = 'Balanced: Adapt your strategy based on the opponent. Read their patterns and counter accordingly.';
  }

  const lowest = sorted[sorted.length - 1];
  const trainingFocus = `Focus on ${lowest.name} (currently ${lowest.value}). Bringing up your weakest stat will improve your overall matchup spread and reduce exploitable weaknesses.`;

  // Synergy: how well stats complement each other
  const variance = stats.reduce((sum, s) => sum + Math.pow(s.value - avg, 2), 0) / 4;
  const synergyScore = Math.round(Math.max(0, 100 - Math.sqrt(variance) * 2));

  let threatLevel: string;
  if (overallRating >= 80) threatLevel = 'Extreme: This fighter dominates most matchups';
  else if (overallRating >= 65) threatLevel = 'High: A serious contender in any battle';
  else if (overallRating >= 50) threatLevel = 'Medium: Competitive with proper strategy';
  else threatLevel = 'Low: Needs stat upgrades to compete at higher tiers';

  return {
    overallRating, tier, strengths, weaknesses,
    bestStrategy, trainingFocus, synergyScore, threatLevel,
  };
}

export async function analyzeFighterWithAI(fighter: Fighter): Promise<FighterAnalysis> {
  const base = analyzeFighter(fighter);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return base;

  try {
    const prompt = `You are a fighting game analyst. Give a brief, insightful analysis of this fighter.

${fighter.name}: ATK:${fighter.attack} DEF:${fighter.defense} SPD:${fighter.speed} INT:${fighter.intelligence} HP:${fighter.hp}

Respond with JSON:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "bestStrategy": "one sentence strategy",
  "trainingFocus": "one sentence training recommendation"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) return base;

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return base;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<FighterAnalysis>;
    if (Array.isArray(parsed.strengths)) base.strengths = parsed.strengths;
    if (Array.isArray(parsed.weaknesses)) base.weaknesses = parsed.weaknesses;
    if (typeof parsed.bestStrategy === 'string') base.bestStrategy = parsed.bestStrategy;
    if (typeof parsed.trainingFocus === 'string') base.trainingFocus = parsed.trainingFocus;

    return base;
  } catch {
    return base;
  }
}

// ============================================================
// Evolution Advisor
// ============================================================

export function getEvolutionAdvice(fighter: Fighter, availablePoints: number): EvolutionAdvice {
  const stats = [
    { name: 'attack', value: fighter.attack },
    { name: 'defense', value: fighter.defense },
    { name: 'speed', value: fighter.speed },
    { name: 'intelligence', value: fighter.intelligence },
  ];

  const sorted = [...stats].sort((a, b) => a.value - b.value);
  const highest = stats.reduce((a, b) => (b.value > a.value ? b : a));

  // Three build paths
  type BuildPath = { name: string; description: string; allocation: { stat: string; points: number; reason: string }[] };
  const builds: BuildPath[] = [];

  // 1. Double down: invest in highest stat
  const doubleDown: BuildPath = {
    name: 'Specialist',
    description: `Maximize ${highest.name} to dominate in your strongest area. High risk, high reward.`,
    allocation: [
      { stat: highest.name, points: Math.ceil(availablePoints * 0.6), reason: `Push ${highest.name} to elite levels for devastating power` },
      { stat: sorted[sorted.length - 2].name, points: Math.floor(availablePoints * 0.4), reason: 'Support your primary stat' },
    ],
  };
  builds.push(doubleDown);

  // 2. Shore up weaknesses
  const balanced: BuildPath = {
    name: 'Well-Rounded',
    description: 'Eliminate weaknesses for consistent performance across all matchups.',
    allocation: sorted.slice(0, 2).map((s, i) => ({
      stat: s.name,
      points: i === 0 ? Math.ceil(availablePoints * 0.5) : Math.floor(availablePoints * 0.5),
      reason: `Bring ${s.name} up from ${s.value} to close the gap`,
    })),
  };
  builds.push(balanced);

  // 3. Speed/Int build for crits
  const tactical: BuildPath = {
    name: 'Tactical',
    description: 'Invest in Speed and Intelligence for critical hits and turn priority.',
    allocation: [
      { stat: 'speed', points: Math.ceil(availablePoints * 0.5), reason: 'Act first in every round' },
      { stat: 'intelligence', points: Math.floor(availablePoints * 0.5), reason: 'Higher critical hit chance and special move damage' },
    ],
  };
  builds.push(tactical);

  // Pick the best build based on current stat distribution
  const variance = stats.reduce((sum, s) => sum + Math.pow(s.value - (stats.reduce((a, b) => a + b.value, 0) / 4), 2), 0) / 4;

  let chosen: BuildPath;
  if (variance > 200) {
    // Already specialized, shore up weaknesses
    chosen = balanced;
  } else if (highest.value > 80) {
    // Already high in something, double down
    chosen = doubleDown;
  } else {
    // Default to tactical for versatility
    chosen = tactical;
  }

  // Project new tier
  const newTotal = fighter.attack + fighter.defense + fighter.speed + fighter.intelligence + availablePoints;
  const newRating = Math.round((newTotal / 400) * 100);
  let projectedTier: string;
  if (newRating >= 85) projectedTier = 'S';
  else if (newRating >= 70) projectedTier = 'A';
  else if (newRating >= 55) projectedTier = 'B';
  else if (newRating >= 40) projectedTier = 'C';
  else projectedTier = 'D';

  return {
    recommendedUpgrades: chosen.allocation,
    buildPath: chosen.name,
    buildDescription: chosen.description,
    projectedTier,
  };
}
