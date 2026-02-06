import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DailyRecord, Badge, Message, ChatUser } from '../backend';
import { Principal } from '@dfinity/principal';

// Helper to determine if we're near the 2 AM IST reset time (within 5 minutes before or after)
function isNearResetTime(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  const istHour = istTime.getUTCHours();
  const istMinute = istTime.getUTCMinutes();
  
  // Check if we're between 1:55 AM and 2:05 AM IST
  return (istHour === 1 && istMinute >= 55) || (istHour === 2 && istMinute <= 5);
}

// Dynamic refetch interval: more frequent near reset time
function getRefetchInterval(): number {
  return isNearResetTime() ? 10000 : 60000; // 10s near reset, 60s otherwise
}

// Real-time leaderboard refetch interval: 30 seconds for live updates
const LEADERBOARD_REFETCH_INTERVAL = 30000; // 30 seconds

// Account Verification and Creation
export function useVerifyAccountExists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['accountExists'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyAccountExists();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUserProfileIfMissing(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountExists'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['allUserStats'] });
      queryClient.invalidateQueries({ queryKey: ['dailyHistory'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      // If profile has empty name, treat it as non-existent
      if (!profile.name || profile.name.trim() === '') {
        return null;
      }
      return profile;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    refetchInterval: getRefetchInterval(),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['allUserStats'] });
      queryClient.invalidateQueries({ queryKey: ['accountExists'] });
      queryClient.invalidateQueries({ queryKey: ['dailyHistory'] });
    },
  });
}

// Daily Problem Tracking
export function useGetTodayProblems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['todayProblems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodayQuestions();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: getRefetchInterval(),
  });
}

export function useUpdateTodayProblems() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (count: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTodayQuestions(count);
    },
    onSuccess: () => {
      // Invalidate all queries that depend on problem counts and cumulative totals
      queryClient.invalidateQueries({ queryKey: ['todayProblems'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['allUserStats'] });
      queryClient.invalidateQueries({ queryKey: ['dailyHistory'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Statistics - Returns cumulative totals calculated from daily records
export function useGetStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const stats = await actor.getStats();
      return stats;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: getRefetchInterval(),
    staleTime: 30000,
    retry: 3,
  });
}

// Daily History - Enhanced with better error handling and immediate sync
export function useGetDailyHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyRecord[]>({
    queryKey: ['dailyHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const history = await actor.getDailyHistory();
        return history || [];
      } catch (error) {
        console.error('Failed to fetch daily history:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: getRefetchInterval(),
    staleTime: 30000,
    retry: 3,
  });
}

// Leaderboard - Real-time updates with 30-second polling interval
// Enhanced with live data synchronization for instant reflection of backend changes
export function useGetAllUserStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{
    name: string;
    totalQuestionsSolved: bigint;
    totalFine: bigint;
    currentStreak: bigint;
    badge?: Badge;
    dailyRecords: DailyRecord[];
    highestDailyQuestions: bigint;
  }>>({
    queryKey: ['allUserStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const stats = await actor.getAllUserStats();
        // Log fetched data for debugging real-time updates
        console.log('[Real-time Update] Fetched all user stats at', new Date().toLocaleTimeString(), ':', 
          stats.map(s => ({ 
            name: s.name, 
            totalFine: Number(s.totalFine),
            totalQuestions: Number(s.totalQuestionsSolved),
            streak: Number(s.currentStreak)
          }))
        );
        return stats || [];
      } catch (error) {
        console.error('Failed to fetch all user stats:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    // Real-time polling: refetch every 30 seconds for live leaderboard updates
    refetchInterval: LEADERBOARD_REFETCH_INTERVAL,
    // Short stale time to ensure data is considered fresh for only 15 seconds
    staleTime: 15000,
    // Refetch on window focus to catch updates when user returns to tab
    refetchOnWindowFocus: true,
    // Always refetch on mount to ensure latest data
    refetchOnMount: 'always',
    // Retry failed requests to maintain live connection
    retry: 3,
    retryDelay: 2000,
    // Keep previous data while fetching to prevent UI flicker during live updates
    placeholderData: (previousData) => previousData,
    // Enable background refetching even when component is not focused
    refetchIntervalInBackground: true,
  });
}

// Chat Queries
export function useGetChatUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChatUser[]>({
    queryKey: ['chatUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getChatUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetChat(receiverPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['chat', receiverPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !receiverPrincipal) return [];
      return actor.getChat(receiverPrincipal);
    },
    enabled: !!actor && !actorFetching && !!receiverPrincipal,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(receiver, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', variables.receiver.toString()] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
