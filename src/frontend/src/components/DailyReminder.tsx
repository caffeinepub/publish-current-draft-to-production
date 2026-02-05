import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { X, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useGetStats } from '../hooks/useQueries';

export default function DailyReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { data: stats } = useGetStats();

  useEffect(() => {
    // Check if reminder was dismissed today
    const dismissedDate = localStorage.getItem('reminderDismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      setDismissed(true);
      return;
    }

    // Show reminder if user hasn't completed 5 problems
    const timer = setTimeout(() => {
      if (stats && Number(stats.todayProblems) < 5) {
        setShowReminder(true);
      }
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [stats]);

  const handleDismiss = () => {
    setShowReminder(false);
    setDismissed(true);
    localStorage.setItem('reminderDismissed', new Date().toDateString());
  };

  if (!showReminder || dismissed) return null;

  const problemsLeft = 5 - Number(stats?.todayProblems || 0);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <Card className="w-80 shadow-2xl border-2 border-primary bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="p-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
              <img 
                src="/assets/generated/notification-bell-cute-transparent.dim_64x64.png" 
                alt="Reminder" 
                className="w-12 h-12 relative z-10 animate-bounce"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Daily Reminder! 🔔
              </h3>
              <p className="text-sm text-foreground">
                You have <span className="font-bold text-primary">{problemsLeft}</span> problem{problemsLeft !== 1 ? 's' : ''} left to complete today!
              </p>
              <p className="text-xs text-muted-foreground">
                Keep your streak going and avoid penalties! 💪
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
