import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginScreen from './components/LoginScreen';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-950 dark:via-pink-950 dark:to-violet-950">
      <Header />
      <main className="flex-1">
        <RouterOutlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function RouterOutlet() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  
  // Show profile setup modal if user is authenticated, profile is loaded, and profile doesn't exist
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Study Buddies...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <Outlet />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: Leaderboard,
});

const routeTree = rootRoute.addChildren([indexRoute, leaderboardRoute]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
