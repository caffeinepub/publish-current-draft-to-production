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
    date: Time;
    penaltyApplied: bigint;
    problemsSolved: bigint;
}
export interface ChatUser {
    principal: Principal;
    name: string;
}
export interface UserProfile {
    name: string;
    totalFine: bigint;
    totalProblemsSolved: bigint;
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
        name: string;
        totalFine: bigint;
        totalProblemsSolved: bigint;
        badge?: Badge;
        currentStreak: bigint;
    }>>;
    getAllUserStats(): Promise<Array<{
        name: string;
        totalFine: bigint;
        dailyRecords: Array<DailyRecord>;
        totalProblemsSolved: bigint;
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
        totalFine: bigint;
        totalProblemsSolved: bigint;
        todayProblems: bigint;
        badge?: Badge;
        currentStreak: bigint;
    }>;
    getTodayProblems(): Promise<bigint>;
    getUserDailyHistory(user: Principal): Promise<Array<DailyRecord>>;
    getUserLifetimeStats(user: Principal): Promise<{
        totalFine: bigint;
        totalProblemsSolved: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(user: Principal): Promise<{
        todayProblems: bigint;
        profile: UserProfile;
        recordCount: bigint;
    } | null>;
    isCallerAdmin(): Promise<boolean>;
    isDailyChallengeCompleted(): Promise<boolean>;
    resetAllUserData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    setTodayProblemsForUser(user: Principal, count: bigint): Promise<void>;
    triggerDailyReset(): Promise<void>;
    updateTodayProblems(count: bigint): Promise<void>;
    updateYesterdayData(): Promise<string>;
    verifyAccountExists(): Promise<{
        accountCreated: boolean;
        exists: boolean;
    }>;
}
