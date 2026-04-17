// ============================================================
// Vision Glass & Interior — Dashboard Stats API
// ============================================================

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import Employee from '@/models/Employee';
import { auth } from '@/lib/auth';
import {
  apiSuccess,
  apiError,
  startOfDayUTC,
  endOfDayUTC,
  startOfMonthUTC,
  endOfMonthUTC,
  percentChange,
} from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const todayStart = startOfDayUTC(now);
    const todayEnd = endOfDayUTC(now);

    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStart = startOfDayUTC(yesterday);
    const yesterdayEnd = endOfDayUTC(yesterday);

    const monthStart = startOfMonthUTC(now);
    const monthEnd = endOfMonthUTC(now);

    const lastMonth = new Date(now);
    lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);
    const lastMonthStart = startOfMonthUTC(lastMonth);
    const lastMonthEnd = endOfMonthUTC(lastMonth);

    const [
      todayAgg,
      yesterdayAgg,
      monthAgg,
      lastMonthAgg,
      activeEmployees,
      topCategoryAgg,
      dailySpend,
      employeeBreakdown,
      recentExpenses,
    ] = await Promise.all([
      // Today's total
      Expense.aggregate([
        { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Yesterday's total
      Expense.aggregate([
        { $match: { date: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // This month's total
      Expense.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Last month's total
      Expense.aggregate([
        { $match: { date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Active employees count
      Employee.countDocuments({ isActive: true }),
      // Top category this month
      Expense.aggregate([
        { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: '$paymentMode', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      // Daily spend for last 30 days
      Expense.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lte: todayEnd,
            },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              mode: '$paymentMode',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
      // Employee breakdown
      Expense.aggregate([
        { $match: { date: { $gte: lastMonthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: {
              employee: '$employee',
              isThisMonth: { $gte: ['$date', monthStart] },
            },
            total: { $sum: '$amount' },
            topMode: { $first: '$paymentMode' },
          },
        },
        {
          $group: {
            _id: '$_id.employee',
            thisMonth: {
              $sum: { $cond: ['$_id.isThisMonth', '$total', 0] },
            },
            lastMonth: {
              $sum: { $cond: ['$_id.isThisMonth', 0, '$total'] },
            },
            topCategory: { $first: '$topMode' },
          },
        },
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $sort: { thisMonth: -1 } },
        { $limit: 10 },
      ]),
      // Recent 10 expenses
      Expense.find()
        .sort({ date: -1, createdAt: -1 })
        .limit(10)
        .populate('employee', '_id employeeId name')
        .lean(),
    ]);

    // Process daily spend data for chart
    const dailySpendMap = new Map<string, { cash: number; upi: number }>();
    for (const item of dailySpend) {
      const dateKey = item._id.date;
      if (!dailySpendMap.has(dateKey)) {
        dailySpendMap.set(dateKey, { cash: 0, upi: 0 });
      }
      const entry = dailySpendMap.get(dateKey)!;
      if (item._id.mode === 'cash') entry.cash = item.total;
      else entry.upi = item.total;
    }

    // Fill in missing dates for last 30 days
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const entry = dailySpendMap.get(key) || { cash: 0, upi: 0 };
      chartData.push({
        date: key,
        cash: entry.cash,
        upi: entry.upi,
        total: entry.cash + entry.upi,
      });
    }

    const todayTotal = todayAgg[0]?.total || 0;
    const yesterdayTotal = yesterdayAgg[0]?.total || 0;
    const monthTotal = monthAgg[0]?.total || 0;
    const lastMonthTotal = lastMonthAgg[0]?.total || 0;

    const stats = {
      todayTotal,
      yesterdayTotal,
      todayDelta: todayTotal - yesterdayTotal,
      monthTotal,
      lastMonthTotal,
      monthDeltaPercent: percentChange(monthTotal, lastMonthTotal),
      activeEmployees,
      topCategory: topCategoryAgg[0]
        ? { mode: topCategoryAgg[0]._id, amount: topCategoryAgg[0].total }
        : { mode: 'cash', amount: 0 },
    };

    const breakdown = employeeBreakdown.map((item) => ({
      employee: {
        _id: item.employee._id,
        employeeId: item.employee.employeeId,
        name: item.employee.name,
      },
      thisMonth: item.thisMonth,
      lastMonth: item.lastMonth,
      delta: item.thisMonth - item.lastMonth,
      topCategory: item.topCategory,
    }));

    return NextResponse.json(
      apiSuccess('Dashboard data fetched', {
        stats,
        chartData,
        employeeBreakdown: breakdown,
        recentTransactions: recentExpenses,
      })
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(apiError('Failed to fetch dashboard data'), { status: 500 });
  }
}
