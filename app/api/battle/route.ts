import { NextRequest, NextResponse } from 'next/server';
import { simulateBattle, simulateBattleWithAI } from '@/lib/ai-engine';
import type { Fighter } from '@/lib/ai-engine';

interface BattleRequest {
  fighter1: Fighter;
  fighter2: Fighter;
  useAI?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BattleRequest;
    const { fighter1, fighter2, useAI } = body;

    if (!fighter1 || !fighter2) {
      return NextResponse.json({ error: 'Missing fighter data' }, { status: 400 });
    }

    const useAINarration = !!(useAI && process.env.OPENAI_API_KEY);

    const result = useAINarration
      ? await simulateBattleWithAI(fighter1, fighter2)
      : simulateBattle(fighter1, fighter2);

    return NextResponse.json({ ...result, aiNarration: useAINarration });
  } catch (error) {
    console.error('Battle simulation error:', error);
    return NextResponse.json({ error: 'Failed to simulate battle' }, { status: 500 });
  }
}
