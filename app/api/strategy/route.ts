import { NextRequest, NextResponse } from 'next/server';
import { generateBattleStrategy, generateBattleStrategyWithAI } from '@/lib/ai-engine';
import type { BattleHistoryEntry } from '@/lib/ai-engine';
import { validateFighter } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { myFighter, opponentFighter, battleHistory, useAI } = body as {
      myFighter: unknown; opponentFighter: unknown; battleHistory?: BattleHistoryEntry[]; useAI?: boolean;
    };

    const v1 = validateFighter(myFighter, 'myFighter');
    if (!v1.valid) return NextResponse.json({ error: 'Invalid myFighter', details: v1.errors }, { status: 400 });
    const v2 = validateFighter(opponentFighter, 'opponentFighter');
    if (!v2.valid) return NextResponse.json({ error: 'Invalid opponentFighter', details: v2.errors }, { status: 400 });

    const useAIStrategy = !!(useAI && process.env.OPENAI_API_KEY);

    const strategy = useAIStrategy
      ? await generateBattleStrategyWithAI(v1.fighter, v2.fighter, battleHistory)
      : generateBattleStrategy(v1.fighter, v2.fighter, battleHistory);

    return NextResponse.json({ ...strategy, isAI: useAIStrategy });
  } catch (error) {
    console.error('Strategy generation error:', error);
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
