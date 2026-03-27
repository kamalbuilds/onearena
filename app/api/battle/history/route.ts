import { NextRequest, NextResponse } from 'next/server';
import { getRecentBattles, getBattlesByFighter } from '@/lib/battle-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fighterId = searchParams.get('fighterId');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

    const battles = fighterId
      ? getBattlesByFighter(fighterId, limit)
      : getRecentBattles(limit);

    return NextResponse.json({ battles, count: battles.length });
  } catch (error) {
    console.error('Battle history error:', error);
    return NextResponse.json({ error: 'Failed to fetch battle history' }, { status: 500 });
  }
}
