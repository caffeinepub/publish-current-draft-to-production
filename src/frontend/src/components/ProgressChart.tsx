import { useMemo } from 'react';
import { useGetDailyHistory } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function ProgressChart() {
  const { data: history = [], isLoading, isError } = useGetDailyHistory();

  // Memoize cumulative chart data for performance
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    
    const recentHistory = history.slice(-14);
    let cumulativeProblems = 0;
    let cumulativeFines = 0;
    
    return recentHistory.map((record) => {
      const date = new Date(Number(record.date) / 1_000_000);
      cumulativeProblems += Number(record.questionsSolved);
      cumulativeFines += Number(record.penaltyApplied);
      
      return {
        date: format(date, 'MMM dd'),
        cumulativeProblems,
        cumulativeFines,
        dailyProblems: Number(record.questionsSolved),
        goalMet: Number(record.questionsSolved) >= 1,
      };
    });
  }, [history]);

  if (isLoading) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Cumulative Progress</CardTitle>
          <CardDescription>Your lifetime question-solving journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load progress data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Cumulative Progress</CardTitle>
          <CardDescription>Your lifetime question-solving journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <img 
              src="/assets/generated/sleepy-cat-transparent.dim_150x150.png" 
              alt="Sleepy Cat" 
              className="w-32 h-32 opacity-50"
            />
            <p className="text-muted-foreground text-center">
              No history yet. Start solving questions to see your cumulative progress! 📊
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestData = chartData[chartData.length - 1];

  return (
    <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Cumulative Progress
            </CardTitle>
            <CardDescription>Lifetime totals growing over time (last {chartData.length} days)</CardDescription>
          </div>
          <img 
            src="/assets/generated/cat-reading-transparent.dim_200x200.png" 
            alt="Reading Cat" 
            className="w-16 h-16 transition-transform duration-300 hover:scale-110"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(1 0.015 310)',
                border: '1px solid oklch(0.90 0.02 300)',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'cumulativeProblems') return [value, 'Total Questions'];
                if (name === 'cumulativeFines') return [`₹${value}`, 'Total Fines'];
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                if (value === 'cumulativeProblems') return 'Cumulative Questions Solved';
                if (value === 'cumulativeFines') return 'Cumulative Fines (₹)';
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeProblems" 
              stroke="oklch(0.60 0.20 290)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'oklch(0.60 0.20 290)' }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeFines" 
              stroke="oklch(0.60 0.18 15)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'oklch(0.60 0.18 15)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-8 mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{latestData.cumulativeProblems}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Questions Solved</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive">₹{latestData.cumulativeFines}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Fines Accumulated</div>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          💡 These totals grow continuously and never reset. Keep solving to increase your lifetime score!
        </p>
      </CardContent>
    </Card>
  );
}
