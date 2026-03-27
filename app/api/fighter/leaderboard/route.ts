import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getMetaAnalysis } from '@/lib/battle-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const leaderboard = getLeaderboard(limit);
    const meta = getMetaAnalysis();

    return NextResponse.json({ leaderboard, meta });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
