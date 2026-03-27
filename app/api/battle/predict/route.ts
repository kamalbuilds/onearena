import { NextRequest, NextResponse } from 'next/server';
import { simulateBattle } from '@/lib/ai-engine';
import type { Fighter } from '@/lib/ai-engine';
import { validateFighter } from '@/lib/validation';
import { getMatchupStats } from '@/lib/battle-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighter1, fighter2 } = body as { fighter1: unknown; fighter2: unknown };

    const v1 = validateFighter(fighter1, 'fighter1');
    if (!v1.valid) return NextResponse.json({ error: 'Invalid fighter1', details: v1.errors }, { status: 400 });
    const v2 = validateFighter(fighter2, 'fighter2');
    if (!v2.valid) return NextResponse.json({ error: 'Invalid fighter2', details: v2.errors }, { status: 400 });

    const f1 = v1.fighter;
    const f2 = v2.fighter;

    // Run Monte Carlo simulation (100 battles) for confidence
    const SIMULATIONS = 100;
    let f1Wins = 0;
    let totalRounds = 0;
    let f1AvgHpLeft = 0;
    let f2AvgHpLeft = 0;

    for (let i = 0; i < SIMULATIONS; i++) {
      const result = simulateBattle(f1, f2);
      if (result.winnerId === f1.id) {
        f1Wins++;
        f1AvgHpLeft += result.fighter1FinalHp;
      } else {
        f2AvgHpLeft += result.fighter2FinalHp;
      }
      totalRounds += result.totalRounds;
    }

    const f1WinRate = f1Wins / SIMULATIONS;
    const f2Wins = SIMULATIONS - f1Wins;
    const avgRounds = Math.round((totalRounds / SIMULATIONS) * 10) / 10;

    const predictedWinner = f1WinRate >= 0.5 ? f1 : f2;
    const confidence = Math.round(Math.max(f1WinRate, 1 - f1WinRate) * 100);

    // Build reasoning
    const reasons: string[] = [];
    const statComparisons = [
      { name: 'Attack', diff: f1.attack - f2.attack },
      { name: 'Defense', diff: f1.defense - f2.defense },
      { name: 'Speed', diff: f1.speed - f2.speed },
      { name: 'Intelligence', diff: f1.intelligence - f2.intelligence },
      { name: 'HP', diff: f1.hp - f2.hp },
    ];

    for (const sc of statComparisons) {
      if (Math.abs(sc.diff) > 5) {
        const leader = sc.diff > 0 ? f1.name : f2.name;
        reasons.push(`${leader} has ${Math.abs(sc.diff)} higher ${sc.name}`);
      }
    }

    if (f1.speed > f2.speed) reasons.push(`${f1.name} acts first due to higher speed`);
    else if (f2.speed > f1.speed) reasons.push(`${f2.name} acts first due to higher speed`);

    // Historical matchup data
    const historicalMatchup = getMatchupStats(f1.id, f2.id);

    return NextResponse.json({
      predictedWinner: {
        id: predictedWinner.id,
        name: predictedWinner.name,
      },
      confidence,
      f1WinRate: Math.round(f1WinRate * 100),
      f2WinRate: Math.round((1 - f1WinRate) * 100),
      avgRounds,
      reasoning: reasons.length > 0 ? reasons : ['Fighters are closely matched, outcome is uncertain'],
      historicalMatchup: historicalMatchup.totalMatches > 0 ? historicalMatchup : null,
      simulationCount: SIMULATIONS,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Failed to predict battle' }, { status: 500 });
  }
}
