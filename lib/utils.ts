import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Sistem Poin & Level ---

const POINTS_KEY = "user_points";
const LEVEL_KEY = "user_level";
const POINTS_PER_LEVEL = 100;

export function getUserPoints(userId: string): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(`${POINTS_KEY}_${userId}`);
  return data ? parseInt(data, 10) : 0;
}

export function addUserPoints(userId: string, points: number): void {
  if (typeof window === "undefined") return;
  const current = getUserPoints(userId);
  const updated = current + points;
  localStorage.setItem(`${POINTS_KEY}_${userId}`, updated.toString());
  // Update level jika perlu
  const level = Math.floor(updated / POINTS_PER_LEVEL) + 1;
  localStorage.setItem(`${LEVEL_KEY}_${userId}`, level.toString());
}

export function getUserLevel(userId: string): number {
  if (typeof window === "undefined") return 1;
  const data = localStorage.getItem(`${LEVEL_KEY}_${userId}`);
  if (data) return parseInt(data, 10);
  // Default level 1
  return 1;
}

export function getLevelProgress(userId: string): {
  current: number;
  max: number;
} {
  const points = getUserPoints(userId);
  const current = points % POINTS_PER_LEVEL;
  return { current, max: POINTS_PER_LEVEL };
}

// --- Badge/Achievement ---
const BADGE_KEY = "user_badges";
export function getUserBadges(userId: string): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${BADGE_KEY}_${userId}`);
  return data ? JSON.parse(data) : [];
}
export function addUserBadge(userId: string, badge: string): void {
  if (typeof window === "undefined") return;
  const badges = getUserBadges(userId);
  if (!badges.includes(badge)) {
    badges.push(badge);
    localStorage.setItem(`${BADGE_KEY}_${userId}`, JSON.stringify(badges));
  }
}

// --- Leaderboard ---
const LEADERBOARD_KEY = "leaderboard";
export type LeaderboardEntry = { userId: string; name: string; points: number };
export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
}
export function updateLeaderboard(
  userId: string,
  name: string,
  points: number
): void {
  if (typeof window === "undefined") return;
  const leaderboard: LeaderboardEntry[] = getLeaderboard();
  const idx = leaderboard.findIndex((e) => e.userId === userId);
  if (idx !== -1) {
    leaderboard[idx].points = points;
    leaderboard[idx].name = name;
  } else {
    leaderboard.push({ userId, name, points });
  }
  leaderboard.sort((a, b) => b.points - a.points);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}
