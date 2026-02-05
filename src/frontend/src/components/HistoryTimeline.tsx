import { useMemo } from 'react';
import { useGetDailyHistory } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

export default function HistoryTimeline() {
  const { data: history = [], isLoading, isError } = useGetDailyHistory();

  // Memoize sorted history (most recent first) with cumulative calculations
  const sortedHistoryWithCumulative = useMemo(() => {
    const sorted = [...history].sort((a, b) => Number(a.date) - Number(b.date));
    let cumulativeProblems = 0;
    let cumulativeFines = 0;
    
    return sorted.map(record => {
      cumulativeProblems += Number(record.problemsSolved);
      cumulativeFines += Number(record.penaltyApplied);
      return {
        ...record,
        cumulativeProblems,
        cumulativeFines,
      };
    }).reverse(); // Reverse to show most recent first
  }, [history]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Daily History</CardTitle>
          <CardDescription>Your past daily activity with cumulative totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 bg-muted-foreground/20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Daily History</CardTitle>
          <CardDescription>Your past daily activity with cumulative totals</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load history data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (sortedHistoryWithCumulative.length === 0) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Daily History</CardTitle>
          <CardDescription>Your past daily activity with cumulative totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <img 
              src="/assets/generated/floating-study-bunny-transparent.dim_200x200.png" 
              alt="Study Bunny" 
              className="w-32 h-32 opacity-50"
            />
            <p className="text-muted-foreground text-center">
              No history yet. Complete your first day to start tracking! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestRecord = sortedHistoryWithCumulative[0];

  return (
    <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Daily History</CardTitle>
            <CardDescription>
              Your past {sortedHistoryWithCumulative.length} day{sortedHistoryWithCumulative.length !== 1 ? 's' : ''} with cumulative lifetime totals
            </CardDescription>
          </div>
          <img 
            src="/assets/generated/rabbit-studying-transparent.dim_200x200.png" 
            alt="Studying Rabbit" 
            className="w-16 h-16 transition-transform duration-300 hover:scale-110"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedHistoryWithCumulative.map((record, index) => {
              const date = new Date(Number(record.date) / 1_000_000);
              const problemsSolved = Number(record.problemsSolved);
              const penalty = Number(record.penaltyApplied);
              const goalMet = problemsSolved >= 5;
              const isToday = index === 0; // Most recent is likely today

              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                    goalMet
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {isToday && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                      Latest
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      goalMet 
                        ? 'bg-green-100 dark:bg-green-900/40' 
                        : 'bg-red-100 dark:bg-red-900/40'
                    }`}>
                      {goalMet ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Date */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {format(date, 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>

                      {/* Daily Stats */}
                      <div className="flex flex-wrap gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className={`w-4 h-4 ${
                            goalMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`} />
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{problemsSolved}</span> / 5 problems
                          </span>
                        </div>

                        {penalty > 0 && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-red-600 dark:text-red-400">₹{penalty}</span> penalty
                            </span>
                          </div>
                        )}

                        {goalMet && (
                          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                            ✨ Goal achieved!
                          </div>
                        )}
                      </div>

                      {/* Cumulative Totals */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-primary">Cumulative:</span>
                            <span>{record.cumulativeProblems} total problems</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>₹{record.cumulativeFines} total fines</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Summary Stats with Cumulative Totals */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedHistoryWithCumulative.filter(r => Number(r.problemsSolved) >= 5).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Days with goal met</div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sortedHistoryWithCumulative.filter(r => Number(r.problemsSolved) < 5).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Days below goal</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {latestRecord.cumulativeProblems}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Lifetime problems</div>
            </div>
            <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                ₹{latestRecord.cumulativeFines}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Lifetime fines</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            💡 Cumulative totals never reset and grow continuously
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
