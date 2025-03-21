import { NextRequest, NextResponse } from 'next/server';
import { analyzeFighter, analyzeFighterWithAI, getEvolutionAdvice } from '@/lib/ai-engine';
import type { Fighter } from '@/lib/ai-engine';

interface AnalyzeRequest {
  fighter: Fighter;
  useAI?: boolean;
  evolutionPoints?: number; // If provided, also returns evolution advice
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { fighter, useAI, evolutionPoints } = body;

    if (!fighter) {
      return NextResponse.json({ error: 'Missing fighter data' }, { status: 400 });
    }

    const useAIAnalysis = !!(useAI && process.env.OPENAI_API_KEY);

    const analysis = useAIAnalysis
      ? await analyzeFighterWithAI(fighter)
      : analyzeFighter(fighter);

    const evolution = typeof evolutionPoints === 'number' && evolutionPoints > 0
      ? getEvolutionAdvice(fighter, evolutionPoints)
      : null;

    return NextResponse.json({
      analysis,
      evolution,
      isAI: useAIAnalysis,
    });
  } catch (error) {
    console.error('Fighter analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze fighter' }, { status: 500 });
  }
}
