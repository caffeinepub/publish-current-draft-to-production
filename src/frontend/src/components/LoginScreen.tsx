import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Shield, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Login successful!', {
        description: 'Welcome to Study Buddies! 🎉',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to login', {
        description: 'Please try again.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex justify-center items-center gap-8 mb-8">
            <img 
              src="/assets/generated/login-welcome-bunny.dim_400x300.png" 
              alt="Welcome Bunny" 
              className="w-64 h-48 object-contain animate-bounce-slow"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
            Welcome to Study Buddies!
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your cute companion for tracking daily DSA problems, maintaining streaks, and staying motivated! 🐰📚
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              size="lg"
              className="rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-700 hover:via-pink-700 hover:to-violet-700 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Secure authentication powered by Internet Computer
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-glow-purple transition-all duration-300 hover:scale-105 hover:-rotate-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Daily Problem Tracking</CardTitle>
              <CardDescription>
                Set your daily goal of 5 DSA problems and track your progress with cute visual indicators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-pink-200 dark:border-pink-800 hover:shadow-glow-pink transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-violet-100 dark:from-pink-900 dark:to-violet-900 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl">Streak & Badges</CardTitle>
              <CardDescription>
                Maintain your streak and earn adorable badges: Persistent Rabbit, DSA Master Cat, and Legendary Scholar!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-violet-200 dark:border-violet-800 hover:shadow-glow-purple transition-all duration-300 hover:scale-105 hover:rotate-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-xl">Leaderboard & Chat</CardTitle>
              <CardDescription>
                Compare your progress with friends, chat with study buddies, and stay motivated together!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Security & Privacy Section */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/50 dark:to-pink-950/50 animate-in fade-in slide-in-from-bottom duration-700 delay-300 shadow-glow-purple">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img 
                src="/assets/generated/auth-security-cat-transparent.dim_200x200.png" 
                alt="Security Cat" 
                className="w-32 h-32 object-contain"
              />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your data is protected with Internet Identity - a secure, privacy-preserving authentication system built on the Internet Computer blockchain. No passwords to remember, no personal data to share!
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium">
                    🔒 Blockchain Security
                  </span>
                  <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 text-sm font-medium">
                    🛡️ Privacy First
                  </span>
                  <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-sm font-medium">
                    ⚡ Fast & Easy
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cute Illustrations Footer */}
        <div className="flex justify-center items-center gap-8 py-12 animate-in fade-in duration-700 delay-400">
          <img 
            src="/assets/generated/study-bunny-transparent.dim_200x200.png" 
            alt="Study Bunny" 
            className="w-20 h-20 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:rotate-6"
          />
          <img 
            src="/assets/generated/rabbit-studying-transparent.dim_200x200.png" 
            alt="Rabbit Studying" 
            className="w-20 h-20 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:-rotate-6"
          />
          <img 
            src="/assets/generated/cat-reading-transparent.dim_200x200.png" 
            alt="Cat Reading" 
            className="w-20 h-20 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:rotate-6"
          />
        </div>
      </div>
    </div>
  );
}
