import { useState, useEffect } from 'react';
import { useGetTodayProblems, useUpdateTodayProblems } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { CheckCircle2, Circle } from 'lucide-react';

export default function DailyTracker() {
  const { data: todayProblems = BigInt(0), isLoading } = useGetTodayProblems();
  const { mutate: updateProblems, isPending } = useUpdateTodayProblems();
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    setSelectedCount(Number(todayProblems));
  }, [todayProblems]);

  const handleCheckboxChange = (index: number) => {
    const newCount = index + 1 === selectedCount ? index : index + 1;
    setSelectedCount(newCount);
    
    updateProblems(BigInt(newCount), {
      onSuccess: () => {
        toast.success(`Updated to ${newCount} problem${newCount !== 1 ? 's' : ''} solved today! 🎉`);
      },
      onError: (error) => {
        toast.error('Failed to update: ' + error.message);
        setSelectedCount(Number(todayProblems));
      },
    });
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

  const problems = Array.from({ length: 5 }, (_, i) => i);
  const isComplete = selectedCount >= 5;

  return (
    <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Today's Progress</CardTitle>
            <CardDescription className="text-base mt-1">
              Track your daily DSA problems (Goal: 5 problems)
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
        <div className="space-y-3">
          {problems.map((index) => {
            const isChecked = index < selectedCount;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                onClick={() => !isPending && handleCheckboxChange(index)}
              >
                <Checkbox
                  checked={isChecked}
                  disabled={isPending}
                  className="w-6 h-6"
                />
                <span className={`text-lg font-medium ${isChecked ? 'text-primary' : 'text-muted-foreground'}`}>
                  Problem {index + 1}
                </span>
                {isChecked && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Problems Solved Today</p>
              <p className="text-3xl font-bold text-primary">{selectedCount} / 5</p>
            </div>
            {isComplete && (
              <div className="text-right">
                <p className="text-2xl">🎉</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Goal Complete!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

