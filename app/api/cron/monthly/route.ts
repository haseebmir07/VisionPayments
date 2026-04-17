// ============================================================
// Vision Glass & Interior — Monthly Cron Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlyReport } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    // Send report for previous month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const success = await sendMonthlyReport(lastMonth);

    if (success) {
      return NextResponse.json(
        apiSuccess('Monthly report sent successfully', { sentAt: new Date().toISOString() })
      );
    }

    return NextResponse.json(apiError('Failed to send monthly report'), { status: 500 });
  } catch (error) {
    console.error('Monthly cron error:', error);
    return NextResponse.json(apiError('Cron job failed'), { status: 500 });
  }
}
