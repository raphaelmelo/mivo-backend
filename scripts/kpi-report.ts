import { Command } from 'commander';
import Table from 'cli-table3';
import { Op, fn, col } from 'sequelize';
import { connectDB } from '../src/utils/db';
import User from '../src/models/User';
import UserBadge from '../src/models/UserBadge';
import UserProgress from '../src/models/UserProgress';
import League from '../src/models/League';

const program = new Command();

// --- Benchmarks (Duolingo / EdTech Context) ---
const BENCHMARKS = {
    stickiness: '20.0%',      // DAU/MAU
    retentionD1: '40.0%',     // Day 1 Retention
    retentionD30: '10.0%',    // Day 30 Retention
    conversion: '4.0%',       // Free to Paid
    completionRate: '50.0%'   // Lesson Completion
};

program
    .name('kpi-report')
    .description('Generate KPI report for MIVO product health')
    .option('-f, --format <type>', 'Output format (json, table)', 'table')
    .action(async (options) => {
        try {
            await connectDB();

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

            // Helper for historical counts (cumulative based on createdAt)
            const getCountAtDate = async (Model: any, date: Date, additionalWhere = {}) => {
                return await Model.count({
                    where: {
                        createdAt: { [Op.lte]: date },
                        ...additionalWhere
                    }
                });
            };

            // --- 1. Current Snapshot ---

            // Basic
            const activeUsers7d = await User.count({ where: { lastActiveDate: { [Op.gte]: sevenDaysAgo } } });
            const totalUsers = await User.count();
            const newUsers = await User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } });
            const totalLessonsCompleted = await UserProgress.count({ where: { isCompleted: true } });
            const badgesAwarded = await UserBadge.count();

            // Retention
            const dau = await User.count({ where: { lastActiveDate: { [Op.gte]: oneDayAgo } } });
            const mau = await User.count({ where: { lastActiveDate: { [Op.gte]: thirtyDaysAgo } } });
            const stickinessVal = mau > 0 ? (dau / mau) * 100 : 0;
            const stickiness = stickinessVal.toFixed(1) + '%';
            const dormantUsers = totalUsers - mau;

            // Financial
            const premiumUsers = await User.count({ where: { isPremium: true } });
            const conversionVal = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
            const conversionRate = conversionVal.toFixed(1) + '%';

            // Pedagogical
            const pedagogicalMetrics = await UserProgress.findOne({
                where: { isCompleted: true },
                attributes: [
                    [fn('AVG', col('timeSpentMinutes')), 'avgTime'],
                    [fn('AVG', col('attempts')), 'avgAttempts']
                ],
                raw: true
            }) as any;
            const avgTimePerLesson = pedagogicalMetrics?.avgTime ? parseFloat(pedagogicalMetrics.avgTime).toFixed(1) + ' min' : '0.0 min';
            const avgAttempts = pedagogicalMetrics?.avgAttempts ? parseFloat(pedagogicalMetrics.avgAttempts).toFixed(1) : '0.0';

            // --- 2. Historical Data (Reconstructed) ---

            // We calculate "Total Users" and "Lessons Completed" for 1 week, 1 month, and 6 months ago
            const historyDates = [
                { label: '1w', date: sevenDaysAgo },
                { label: '1m', date: thirtyDaysAgo },
                { label: '6m', date: sixMonthsAgo }
            ];

            const historyData: any = {};

            for (const h of historyDates) {
                historyData[h.label] = {
                    totalUsers: await getCountAtDate(User, h.date),
                    lessonsCompleted: await getCountAtDate(UserProgress, h.date, { isCompleted: true }),
                    badgesAwarded: await getCountAtDate(UserBadge, h.date),
                    premiumUsers: await getCountAtDate(User, h.date, { isPremium: true })
                };
            }

            // --- Output Construction ---

            const kpiData = {
                current: {
                    basic: { activeUsers7d, totalUsers, newUsers, totalLessonsCompleted, badgesAwarded },
                    retention: { dau, mau, stickiness, dormantUsers },
                    financial: { premiumUsers, conversionRate },
                    pedagogical: { avgTimePerLesson, avgAttempts }
                },
                history: historyData,
                benchmarks: BENCHMARKS
            };

            if (options.format === 'json') {
                console.log(JSON.stringify(kpiData, null, 2));
            } else {
                const table = new Table({
                    head: ['Category', 'KPI', 'Current', '1w Ago', '1m Ago', '6m Ago', 'Benchmark'],
                    colWidths: [12, 25, 12, 10, 10, 10, 15],
                    wordWrap: true
                });

                // Helper to format change: "Value (Growth)"
                const fmtDiff = (curr: number, prev: number) => {
                    const diff = curr - prev;
                    const sign = diff >= 0 ? '+' : '';

                    if (prev === 0) {
                        return diff === 0 ? '0' : `0 (${sign}${diff})`;
                    }

                    const pct = ((diff / prev) * 100).toFixed(0);
                    return `${prev} (${sign}${pct}%)`;
                };

                // Calculate avg lessons per user
                const avgLessonsPerUser = totalUsers > 0 ? (totalLessonsCompleted / totalUsers).toFixed(1) : '0.0';

                table.push(
                    // Growth
                    ['Growth', 'Total Users',
                        totalUsers,
                        fmtDiff(totalUsers, historyData['1w'].totalUsers),
                        fmtDiff(totalUsers, historyData['1m'].totalUsers),
                        fmtDiff(totalUsers, historyData['6m'].totalUsers),
                        '-'
                    ] as any,
                    ['Growth', 'New Users (7d)', newUsers, '-', '-', '-', '-'] as any,

                    // Engagement
                    ['Engagement', 'Active Users (7d)', activeUsers7d, '-', '-', '-', '-'] as any,
                    ['Engagement', 'Lessons Completed',
                        totalLessonsCompleted,
                        fmtDiff(totalLessonsCompleted, historyData['1w'].lessonsCompleted),
                        fmtDiff(totalLessonsCompleted, historyData['1m'].lessonsCompleted),
                        fmtDiff(totalLessonsCompleted, historyData['6m'].lessonsCompleted),
                        '-'
                    ] as any,
                    ['Engagement', 'Avg Lessons/User', avgLessonsPerUser, '-', '-', '-', '-'] as any,
                    ['Engagement', 'Badges Awarded',
                        badgesAwarded,
                        fmtDiff(badgesAwarded, historyData['1w'].badgesAwarded),
                        fmtDiff(badgesAwarded, historyData['1m'].badgesAwarded),
                        fmtDiff(badgesAwarded, historyData['6m'].badgesAwarded),
                        '-'
                    ] as any,

                    // Retention
                    ['Retention', 'DAU (24h)', dau, '-', '-', '-', '-'] as any,
                    ['Retention', 'MAU (30d)', mau, '-', '-', '-', '-'] as any,
                    ['Retention', 'Stickiness (DAU/MAU)', stickiness, '-', '-', '-', BENCHMARKS.stickiness] as any,
                    ['Retention', 'Dormant Users (>30d)', dormantUsers, '-', '-', '-', '-'] as any,

                    // Financial
                    ['Financial', 'Premium Users',
                        premiumUsers,
                        fmtDiff(premiumUsers, historyData['1w'].premiumUsers),
                        fmtDiff(premiumUsers, historyData['1m'].premiumUsers),
                        fmtDiff(premiumUsers, historyData['6m'].premiumUsers),
                        '-'
                    ] as any,
                    ['Financial', 'Conversion Rate', conversionRate, '-', '-', '-', BENCHMARKS.conversion] as any,

                    // Pedagogical
                    ['Pedagogical', 'Avg Time/Lesson', avgTimePerLesson, '-', '-', '-', '-'] as any,
                    ['Pedagogical', 'Avg Attempts/Lesson', avgAttempts, '-', '-', '-', '-'] as any
                );

                console.log(table.toString());
                console.log('\n* Historical values show: "Value at Date (Growth % since then)"');
                console.log('* Benchmarks based on Gamified EdTech standards (e.g. Duolingo)');
            }

            process.exit(0);
        } catch (error) {
            console.error('Error generating KPI report:', error);
            process.exit(1);
        }
    });

program.parse(process.argv);
