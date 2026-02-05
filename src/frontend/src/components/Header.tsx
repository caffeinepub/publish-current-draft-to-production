import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Moon, Sun, Sparkles, Trophy, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import ChatDialog from './ChatDialog';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate({ to: '/' })}>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
              Study Buddies
            </h1>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={currentPath === '/' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/' })}
                className="rounded-full transition-all duration-300 hover:scale-105"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentPath === '/leaderboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/leaderboard' })}
                className="rounded-full transition-all duration-300 hover:scale-105"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-foreground">
                Hi, {userProfile.name}! 👋
              </span>
            </div>
          )}
          
          {isAuthenticated && <ChatDialog />}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={handleAuth}
            disabled={disabled}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-border/40 bg-background/95">
          <div className="container mx-auto px-4 py-2 flex gap-2">
            <Button
              variant={currentPath === '/' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="flex-1 rounded-full transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentPath === '/leaderboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/leaderboard' })}
              className="flex-1 rounded-full transition-all duration-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
