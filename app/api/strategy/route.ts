import { NextRequest, NextResponse } from 'next/server';
import { generateBattleStrategy, generateBattleStrategyWithAI } from '@/lib/ai-engine';
import type { Fighter, BattleHistoryEntry } from '@/lib/ai-engine';

interface StrategyRequest {
  myFighter: Fighter;
  opponentFighter: Fighter;
  battleHistory?: BattleHistoryEntry[];
  useAI?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StrategyRequest;
    const { myFighter, opponentFighter, battleHistory, useAI } = body;

    if (!myFighter || !opponentFighter) {
      return NextResponse.json({ error: 'Missing fighter data' }, { status: 400 });
    }

    const useAIStrategy = !!(useAI && process.env.OPENAI_API_KEY);

    const strategy = useAIStrategy
      ? await generateBattleStrategyWithAI(myFighter, opponentFighter, battleHistory)
      : generateBattleStrategy(myFighter, opponentFighter, battleHistory);

    return NextResponse.json({ ...strategy, isAI: useAIStrategy });
  } catch (error) {
    console.error('Strategy generation error:', error);
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
