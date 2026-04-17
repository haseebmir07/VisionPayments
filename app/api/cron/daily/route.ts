// ============================================================
// Vision Glass & Interior — Daily Cron Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendDailyReport } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const success = await sendDailyReport(new Date());

    if (success) {
      return NextResponse.json(
        apiSuccess('Daily report sent successfully', { sentAt: new Date().toISOString() })
      );
    }

    return NextResponse.json(apiError('Failed to send daily report'), { status: 500 });
  } catch (error) {
    console.error('Daily cron error:', error);
    return NextResponse.json(apiError('Cron job failed'), { status: 500 });
  }
}
