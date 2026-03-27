import { NextRequest, NextResponse } from 'next/server';
import { simulateBattle, simulateBattleWithAI } from '@/lib/ai-engine';
import { validateFighter } from '@/lib/validation';
import { recordBattle } from '@/lib/battle-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighter1, fighter2, useAI } = body as { fighter1: unknown; fighter2: unknown; useAI?: boolean };

    const v1 = validateFighter(fighter1, 'fighter1');
    if (!v1.valid) return NextResponse.json({ error: 'Invalid fighter1', details: v1.errors }, { status: 400 });
    const v2 = validateFighter(fighter2, 'fighter2');
    if (!v2.valid) return NextResponse.json({ error: 'Invalid fighter2', details: v2.errors }, { status: 400 });

    const f1 = v1.fighter;
    const f2 = v2.fighter;
    const useAINarration = !!(useAI && process.env.OPENAI_API_KEY);

    const result = useAINarration
      ? await simulateBattleWithAI(f1, f2)
      : simulateBattle(f1, f2);

    // Record to history
    recordBattle(f1, f2, result);

    return NextResponse.json({ ...result, aiNarration: useAINarration });
  } catch (error) {
    console.error('Battle simulation error:', error);
    return NextResponse.json({ error: 'Failed to simulate battle' }, { status: 500 });
  }
}
