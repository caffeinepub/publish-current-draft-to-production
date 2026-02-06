import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { X } from 'lucide-react';
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

    // Show reminder only if user has solved 0 questions
    const timer = setTimeout(() => {
      if (stats && Number(stats.todayQuestions) === 0) {
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
                You haven't logged any questions today yet!
              </p>
              <p className="text-xs text-muted-foreground">
                Solve at least <strong>1 question</strong> to keep your streak going and avoid the ₹20 fine! 💪
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
