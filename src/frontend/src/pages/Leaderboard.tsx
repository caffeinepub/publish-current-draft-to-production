import { useMemo, memo, useEffect, useState } from 'react';
import { useGetAllUserStats } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Medal, Award, TrendingUp, BarChart3, Flame, DollarSign, AlertCircle, RefreshCw, Info } from 'lucide-react';
import BadgeDisplay from '../components/BadgeDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

// Memoized chart components for performance
const MemoizedLineChart = memo(LineChart);
const MemoizedBarChart = memo(BarChart);

export default function Leaderboard() {
  const { data: allUserStats, isLoading, isError, dataUpdatedAt, isFetching } = useGetAllUserStats();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // Update last refresh time whenever data is fetched
  useEffect(() => {
    if (dataUpdatedAt) {
      const time = new Date(dataUpdatedAt).toLocaleTimeString();
      setLastUpdateTime(time);
    }
  }, [dataUpdatedAt]);

  // Memoize sorted users by cumulative totals
  const sortedUsers = useMemo(() => {
    if (!allUserStats) return [];
    return [...allUserStats].sort(
      (a, b) => Number(b.totalProblemsSolved) - Number(a.totalProblemsSolved)
    );
  }, [allUserStats]);

  // Memoize chart data with cumulative calculations
  const chartData = useMemo(() => {
    const prepareProblemsComparisonData = () => {
      return sortedUsers.map((user, index) => ({
        name: user.name || 'Anonymous',
        problems: Number(user.totalProblemsSolved),
        rank: index + 1,
      }));
    };

    const prepareFinesComparisonData = () => {
      return sortedUsers.map((user, index) => ({
        name: user.name || 'Anonymous',
        fine: Number(user.totalFine),
        rank: index + 1,
      }));
    };

    const prepareStreaksComparisonData = () => {
      return sortedUsers.map((user, index) => ({
        name: user.name || 'Anonymous',
        streak: Number(user.currentStreak),
        rank: index + 1,
      }));
    };

    const prepareCumulativeProgressData = () => {
      if (!allUserStats || allUserStats.length === 0) return [];

      const allDates = new Set<number>();
      allUserStats.forEach(user => {
        if (user.dailyRecords && user.dailyRecords.length > 0) {
          user.dailyRecords.forEach(record => {
            const dateNum = Number(record.date);
            allDates.add(dateNum);
          });
        }
      });

      if (allDates.size === 0) return [];

      const sortedDates = Array.from(allDates).sort((a, b) => a - b);
      const recentDates = sortedDates.slice(-14);

      return recentDates.map(dateNum => {
        const dataPoint: any = {
          date: new Date(Number(dateNum) / 1_000_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };

        allUserStats.forEach(user => {
          const userName = user.name || 'Anonymous';
          let cumulative = 0;
          if (user.dailyRecords && user.dailyRecords.length > 0) {
            user.dailyRecords.forEach(record => {
              if (Number(record.date) <= dateNum) {
                cumulative += Number(record.problemsSolved);
              }
            });
          }
          dataPoint[userName] = cumulative;
        });

        return dataPoint;
      });
    };

    return {
      cumulativeProgressData: prepareCumulativeProgressData(),
      problemsData: prepareProblemsComparisonData(),
      finesData: prepareFinesComparisonData(),
      streaksData: prepareStreaksComparisonData(),
    };
  }, [sortedUsers, allUserStats]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const getRankBgColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
    if (index === 1) return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 border-gray-300 dark:border-gray-700';
    if (index === 2) return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
    return 'bg-background border-border';
  };

  const chartColors = [
    'oklch(0.60 0.20 290)',
    'oklch(0.65 0.18 320)',
    'oklch(0.70 0.15 270)',
    'oklch(0.75 0.12 340)',
    'oklch(0.55 0.22 310)',
    'oklch(0.68 0.16 300)',
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg animate-in fade-in duration-200">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load leaderboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section with Live Update Indicator */}
      <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
        <div className="flex justify-center">
          <img 
            src="/assets/generated/leaderboard-trophy-transparent.dim_80x80.png" 
            alt="Trophy" 
            className="w-20 h-20 animate-bounce"
          />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
          Leaderboard
        </h2>
        <p className="text-muted-foreground text-lg">
          See how you stack up against other study buddies! 🏆
        </p>
        <p className="text-sm text-muted-foreground">
          Rankings based on <span className="font-semibold text-primary">lifetime cumulative totals</span> that never reset
        </p>
        
        {/* Live Update Status Badge */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 animate-in fade-in duration-500">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs">
              {isFetching ? 'Updating...' : 'Live Updates Active'}
            </span>
          </Badge>
          {lastUpdateTime && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdateTime}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          🔄 Auto-refreshes every 30 seconds for real-time stats
        </p>
      </div>

      {/* Fair Evaluation Notice */}
      <Alert className="border-primary/50 bg-primary/5 animate-in slide-in-from-top duration-700 delay-100">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Fair Evaluation System:</span> All users are evaluated at 2:00 AM IST daily, regardless of join time. Everyone's progress, penalties, and streaks are calculated consistently and fairly.
        </AlertDescription>
      </Alert>

      {sortedUsers.length === 0 ? (
        <Card className="gradient-card animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No users yet. Be the first to start solving problems!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Comparative Charts Section */}
          <Card className="gradient-card shadow-xl animate-in slide-in-from-bottom duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="w-6 h-6 text-primary" />
                Cumulative Performance Comparison
                {isFetching && (
                  <RefreshCw className="w-4 h-4 animate-spin text-primary ml-auto" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                All totals are cumulative and grow continuously over time • Updates live every 30 seconds
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cumulative" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="cumulative" className="transition-all duration-300">Cumulative Progress</TabsTrigger>
                  <TabsTrigger value="problems" className="transition-all duration-300">Lifetime Problems</TabsTrigger>
                  <TabsTrigger value="fines" className="transition-all duration-300">Lifetime Fines</TabsTrigger>
                  <TabsTrigger value="streaks" className="transition-all duration-300">Current Streaks</TabsTrigger>
                </TabsList>

                {/* Cumulative Progress Chart */}
                <TabsContent value="cumulative" className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Cumulative Problems Solved Over Time</h3>
                  </div>
                  {chartData.cumulativeProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <MemoizedLineChart data={chartData.cumulativeProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 300)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="oklch(0.50 0.06 290)"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="oklch(0.50 0.06 290)"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        {sortedUsers.map((user, index) => (
                          <Line
                            key={user.name}
                            type="monotone"
                            dataKey={user.name || 'Anonymous'}
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </MemoizedLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No historical data available yet. Start solving problems to see cumulative progress!
                    </div>
                  )}
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    📈 Watch your lifetime totals grow day by day! Updates automatically every 30 seconds.
                  </p>
                </TabsContent>

                {/* Lifetime Problems Bar Chart */}
                <TabsContent value="problems" className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Lifetime Problems Solved Comparison</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <MemoizedBarChart data={chartData.problemsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 300)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="problems" 
                        fill="oklch(0.60 0.20 290)"
                        radius={[8, 8, 0, 0]}
                      />
                    </MemoizedBarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {sortedUsers.slice(0, 3).map((user, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <BadgeDisplay badge={user.badge} size="small" animate />
                        <span className="text-sm text-muted-foreground">
                          {user.name}: {Number(user.totalProblemsSolved)} lifetime problems
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    🎯 Cumulative totals that never reset - your lifetime achievement!
                  </p>
                </TabsContent>

                {/* Lifetime Fines Bar Chart */}
                <TabsContent value="fines" className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-destructive" />
                    <h3 className="text-lg font-semibold">Lifetime Fines Comparison</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <MemoizedBarChart data={chartData.finesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 300)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="fine" 
                        fill="oklch(0.60 0.18 15)"
                        radius={[8, 8, 0, 0]}
                      />
                    </MemoizedBarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground">
                    Lower is better! Keep your streak going to minimize lifetime fines. 💪
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    💰 Total accumulated fines across all time • Live updates every 30 seconds
                  </p>
                </TabsContent>

                {/* Current Streaks Bar Chart */}
                <TabsContent value="streaks" className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Current Streak Comparison</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <MemoizedBarChart data={chartData.streaksData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 300)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="oklch(0.50 0.06 290)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="streak" 
                        fill="oklch(0.75 0.15 60)"
                        radius={[8, 8, 0, 0]}
                      />
                    </MemoizedBarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground">
                    Keep the fire burning! 🔥 Consistency is key to success.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Leaderboard List */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-center animate-in slide-in-from-bottom duration-700 delay-300">
                Rankings by Lifetime Totals
              </h3>
              {isFetching && (
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              )}
            </div>
            {sortedUsers.map((user, index) => (
              <Card 
                key={`${user.name}-${index}`}
                className={`${getRankBgColor(index)} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom`}
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getRankIcon(index)}
                    </div>

                    {/* Badge */}
                    <div className="flex-shrink-0">
                      <BadgeDisplay badge={user.badge} size="medium" animate={index < 3} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground truncate">
                        {user.name || 'Anonymous'}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 transition-all duration-300 hover:scale-110">
                          <TrendingUp className="w-4 h-4" />
                          <span>{Number(user.totalProblemsSolved)} lifetime problems</span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 hover:scale-110">
                          <span>🔥</span>
                          <span>{Number(user.currentStreak)} day streak</span>
                        </div>
                        <div className="flex items-center gap-1 transition-all duration-300 hover:scale-110">
                          <span>💰</span>
                          <span>₹{Number(user.totalFine)} lifetime fine</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary (Desktop) */}
                    <div className="hidden lg:flex flex-col items-end gap-1">
                      <div className="text-3xl font-bold text-primary">
                        {Number(user.totalProblemsSolved)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        lifetime total
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Cute Illustrations Footer */}
      <div className="flex justify-center items-center gap-8 py-8">
        <img 
          src="/assets/generated/study-bunny-transparent.dim_200x200.png" 
          alt="Study Bunny" 
          className="w-24 h-24 opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:rotate-6"
        />
        <img 
          src="/assets/generated/rabbit-studying-transparent.dim_200x200.png" 
          alt="Rabbit Studying" 
          className="w-24 h-24 opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:-rotate-6"
        />
        <img 
          src="/assets/generated/cat-reading-transparent.dim_200x200.png" 
          alt="Cat Reading" 
          className="w-24 h-24 opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:rotate-6"
        />
      </div>
    </div>
  );
}
