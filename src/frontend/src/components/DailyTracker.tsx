import { useState, useEffect } from 'react';
import { useGetTodayProblems, useUpdateTodayProblems } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Save, TrendingUp } from 'lucide-react';

export default function DailyTracker() {
  const { data: todayProblems = BigInt(0), isLoading } = useGetTodayProblems();
  const { mutate: updateProblems, isPending } = useUpdateTodayProblems();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(todayProblems.toString());
  }, [todayProblems]);

  const handleSave = () => {
    // Treat blank/empty input as 0
    const trimmedValue = inputValue.trim();
    const count = trimmedValue === '' ? 0 : parseInt(trimmedValue, 10);

    // Validate non-negative integer
    if (isNaN(count) || count < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    updateProblems(BigInt(count), {
      onSuccess: () => {
        toast.success(
          count === 0
            ? 'Updated to 0 questions. Remember: solve at least 1 to maintain your streak! ⚠️'
            : `Great! ${count} question${count !== 1 ? 's' : ''} logged today! 🎉`
        );
      },
      onError: (error) => {
        toast.error('Failed to update: ' + error.message);
        setInputValue(todayProblems.toString());
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleSave();
    }
  };

  if (isLoading) {
    return (
      <Card className="gradient-card border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCount = Number(todayProblems);

  return (
    <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Today's Progress</CardTitle>
            <CardDescription className="text-base mt-1">
              Track your daily questions solved
            </CardDescription>
          </div>
          <img 
            src="/assets/generated/rabbit-studying-transparent.dim_200x200.png" 
            alt="Studying Rabbit" 
            className="w-16 h-16"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questions-count" className="text-base font-medium">
              Questions Solved Today
            </Label>
            <div className="flex gap-3">
              <Input
                id="questions-count"
                type="number"
                min="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number of questions"
                disabled={isPending}
                className="text-lg h-12"
              />
              <Button
                onClick={handleSave}
                disabled={isPending}
                size="lg"
                className="px-6"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave blank or enter 0 if you haven't solved any questions today
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Streak Rules</h3>
            </div>
            <ul className="space-y-1 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Solve <strong>at least 1 question</strong> to maintain/increase your streak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>Solve <strong>0 questions</strong> and your streak resets + ₹20 fine applied</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Count</p>
              <p className="text-4xl font-bold text-primary">{currentCount}</p>
            </div>
            {currentCount > 0 && (
              <div className="text-right">
                <p className="text-3xl">🎯</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Streak Safe!
                </p>
              </div>
            )}
            {currentCount === 0 && (
              <div className="text-right">
                <p className="text-3xl">⚠️</p>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  At Risk
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
