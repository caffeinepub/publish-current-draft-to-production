import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Principal = Principal;
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export interface DailyRecord {
    questionsSolved: bigint;
    date: Time;
    penaltyApplied: bigint;
}
export interface ChatUser {
    principal: Principal;
    name: string;
}
export interface UserProfile {
    totalQuestionsSolved: bigint;
    name: string;
    totalFine: bigint;
    badge?: Badge;
    currentStreak: bigint;
}
export enum Badge {
    dsaMasterCat = "dsaMasterCat",
    legendaryScholar = "legendaryScholar",
    persistentRabbit = "persistentRabbit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserProfileIfMissing(name: string): Promise<string>;
    getAllLifetimeStats(): Promise<Array<{
        highestDailyQuestions: bigint;
        totalQuestionsSolved: bigint;
        name: string;
        totalFine: bigint;
        badge?: Badge;
        currentStreak: bigint;
    }>>;
    getAllUserStats(): Promise<Array<{
        highestDailyQuestions: bigint;
        totalQuestionsSolved: bigint;
        name: string;
        totalFine: bigint;
        dailyRecords: Array<DailyRecord>;
        badge?: Badge;
        currentStreak: bigint;
    }>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getChat(receiver: Principal): Promise<Array<Message>>;
    getChatUsers(): Promise<Array<ChatUser>>;
    getDailyHistory(): Promise<Array<DailyRecord>>;
    getStats(): Promise<{
        highestDailyQuestions: bigint;
        totalQuestionsSolved: bigint;
        todayQuestions: bigint;
        totalFine: bigint;
        badge?: Badge;
        currentStreak: bigint;
    }>;
    getTodayQuestions(): Promise<bigint>;
    getUserDailyHistory(user: Principal): Promise<Array<DailyRecord>>;
    getUserLifetimeStats(user: Principal): Promise<{
        totalQuestionsSolved: bigint;
        totalFine: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(user: Principal): Promise<{
        highestDailyQuestions: bigint;
        todayQuestions: bigint;
        profile: UserProfile;
        recordCount: bigint;
    } | null>;
    isCallerAdmin(): Promise<boolean>;
    isDailyChallengeCompleted(): Promise<boolean>;
    resetAllUserData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    setTodayQuestionsForUser(user: Principal, count: bigint): Promise<void>;
    triggerDailyReset(): Promise<void>;
    updateTodayQuestions(count: bigint): Promise<void>;
    updateYesterdayData(): Promise<string>;
    verifyAccountExists(): Promise<{
        accountCreated: boolean;
        exists: boolean;
    }>;
}
