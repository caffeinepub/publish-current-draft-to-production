import { useGetStats, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, Flame, Target } from 'lucide-react';
import BadgeDisplay from './BadgeDisplay';

export default function StatsCard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isLoading = statsLoading || profileLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="gradient-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if no profile (ProfileSetupModal will handle this)
  if (!userProfile) {
    return null;
  }

  const statCards = [
    {
      title: 'Lifetime Questions Solved',
      value: Number(stats?.totalQuestionsSolved || 0),
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      description: 'Total cumulative',
    },
    {
      title: 'Current Streak',
      value: `${Number(stats?.currentStreak || 0)} days`,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      description: 'Keep it going!',
    },
    {
      title: 'Lifetime Total Fine',
      value: `₹${Number(stats?.totalFine || 0)}`,
      icon: DollarSign,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      description: 'Total accumulated',
    },
    {
      title: 'Today\'s Progress',
      value: `${Number(stats?.todayQuestions || 0)}`,
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-100 dark:bg-violet-900/30',
      description: 'Questions today',
    },
  ];

  return (
    <div className="space-y-4">
      {/* User Profile Card with Badge Display */}
      <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                {userProfile.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Keep up the great work! 🌟
              </p>
            </div>
            <BadgeDisplay badge={stats?.badge} size="large" showLabel />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
