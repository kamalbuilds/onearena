import { NextRequest, NextResponse } from 'next/server';
import { analyzeFighter, analyzeFighterWithAI, getEvolutionAdvice } from '@/lib/ai-engine';
import { validateFighter } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighter, useAI, evolutionPoints } = body as { fighter: unknown; useAI?: boolean; evolutionPoints?: number };

    const v = validateFighter(fighter, 'fighter');
    if (!v.valid) return NextResponse.json({ error: 'Invalid fighter', details: v.errors }, { status: 400 });

    const f = v.fighter;
    const useAIAnalysis = !!(useAI && process.env.OPENAI_API_KEY);

    const analysis = useAIAnalysis
      ? await analyzeFighterWithAI(f)
      : analyzeFighter(f);

    const evolution = typeof evolutionPoints === 'number' && evolutionPoints > 0 && evolutionPoints <= 100
      ? getEvolutionAdvice(f, Math.round(evolutionPoints))
      : null;

    return NextResponse.json({ analysis, evolution, isAI: useAIAnalysis });
  } catch (error) {
    console.error('Fighter analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze fighter' }, { status: 500 });
  }
}
