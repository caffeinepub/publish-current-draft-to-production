import StatsCard from '../components/StatsCard';
import DailyTracker from '../components/DailyTracker';
import ProgressChart from '../components/ProgressChart';
import HistoryTimeline from '../components/HistoryTimeline';
import MotivationalQuote from '../components/MotivationalQuote';
import DailyReminder from '../components/DailyReminder';
import AdminPanel from '../components/AdminPanel';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

export default function Dashboard() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Show loading state while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If profile doesn't exist, the ProfileSetupModal will handle it
  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Setting up your profile...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent animate-in slide-in-from-top duration-700">
          Your Study Dashboard
        </h2>
        <p className="text-muted-foreground text-lg animate-in slide-in-from-top duration-700 delay-100">
          Track your cumulative progress and stay motivated! 🚀
        </p>
      </div>

      {/* Fair Evaluation Notice */}
      <Alert className="border-primary/50 bg-primary/5 animate-in slide-in-from-top duration-700 delay-150">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Fair Evaluation:</span> All users are evaluated at 2:00 AM IST daily, regardless of when you joined. Your progress and penalties are calculated consistently with everyone else.
        </AlertDescription>
      </Alert>

      {/* Admin Panel - Only visible to admins */}
      {!isAdminLoading && isAdmin && (
        <div className="animate-in slide-in-from-top duration-700 delay-200">
          <AdminPanel />
        </div>
      )}

      {/* Stats Overview with Badge and User Card - Shows Cumulative Totals */}
      <div className="animate-in slide-in-from-bottom duration-700 delay-250">
        <StatsCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Tracker - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 animate-in slide-in-from-left duration-700 delay-300">
          <DailyTracker />
        </div>

        {/* Motivational Quote */}
        <div className="lg:col-span-1 animate-in slide-in-from-right duration-700 delay-300">
          <MotivationalQuote />
        </div>
      </div>

      {/* Progress Chart - Full Width - Shows Cumulative Growth */}
      <div className="animate-in slide-in-from-bottom duration-700 delay-400">
        <ProgressChart />
      </div>

      {/* History Timeline Section - Shows Daily Activity with Cumulative Totals */}
      <div className="animate-in slide-in-from-bottom duration-700 delay-500">
        <HistoryTimeline />
      </div>

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

      {/* Daily Reminder Notification */}
      <DailyReminder />
    </div>
  );
}
