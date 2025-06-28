export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // index of correct option
};

export type QuizLeaderboardEntry = {
  user: string;
  score: number;
  date: string;
};

// Dummy quiz data
const quizData: Record<string, Record<string, QuizQuestion[]>> = {
  // courseId: { materialId: [questions] }
  "1": {
    m1: [
      {
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language",
        ],
        answer: 0,
      },
    ],
    m2: [
      {
        question: "Which property is used to change text color in CSS?",
        options: ["font-color", "color", "text-color"],
        answer: 1,
      },
    ],
    m3: [
      {
        question:
          "Which symbol is used for single-line comments in JavaScript?",
        options: ["//", "<!-- -->", "#"],
        answer: 0,
      },
    ],
  },
  "2": {
    m1: [
      {
        question: "What is JSX?",
        options: [
          "A CSS preprocessor",
          "A syntax extension for JavaScript",
          "A database query language",
        ],
        answer: 1,
      },
    ],
    m2: [
      {
        question: "What is a React component?",
        options: [
          "A function or class that returns JSX",
          "A CSS file",
          "A database",
        ],
        answer: 0,
      },
    ],
    m3: [
      {
        question: "Which hook is used for state in React?",
        options: ["useState", "useEffect", "useContext"],
        answer: 0,
      },
    ],
  },
  "3": {
    m1: [
      {
        question: "What is Next.js primarily used for?",
        options: [
          "Mobile apps",
          "Server-side rendering for React",
          "Game development",
        ],
        answer: 1,
      },
    ],
    m2: [
      {
        question: "Which ORM is mentioned in the roadmap?",
        options: ["Sequelize", "Prisma", "TypeORM"],
        answer: 1,
      },
    ],
    m3: [
      {
        question: "Where can you deploy a Next.js app for free (per roadmap)?",
        options: ["Vercel", "AWS", "Heroku"],
        answer: 0,
      },
    ],
  },
};

export function getQuiz(courseId: string, materialId: string): QuizQuestion[] {
  return quizData[courseId]?.[materialId] || [];
}

const QUIZ_SCORE_KEY_PREFIX = "quiz_score_";
const QUIZ_LEADERBOARD_KEY_PREFIX = "quiz_leaderboard_";

export function getUserQuizScore(
  userId: string,
  courseId: string,
  materialId: string
): number | null {
  if (typeof window === "undefined") return null;
  const key = `${QUIZ_SCORE_KEY_PREFIX}${userId}_${courseId}_${materialId}`;
  const val = localStorage.getItem(key);
  if (!val) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export function setUserQuizScore(
  userId: string,
  courseId: string,
  materialId: string,
  score: number,
  userName?: string
): void {
  if (typeof window === "undefined") return;
  const key = `${QUIZ_SCORE_KEY_PREFIX}${userId}_${courseId}_${materialId}`;
  localStorage.setItem(key, String(score));
  if (userName) {
    addToLeaderboard(userId, userName, courseId, materialId, score);
  }
}

export function addToLeaderboard(
  userId: string,
  userName: string,
  courseId: string,
  materialId: string,
  score: number
) {
  if (typeof window === "undefined") return;
  const key = `${QUIZ_LEADERBOARD_KEY_PREFIX}${courseId}_${materialId}`;
  let entries: QuizLeaderboardEntry[] = [];
  try {
    entries = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {}
  // Remove previous entry for this user
  entries = entries.filter((e) => e.user !== userName);
  entries.push({ user: userName, score, date: new Date().toISOString() });
  // Sort by score desc, then date asc
  entries.sort(
    (a, b) =>
      b.score - a.score ||
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  // Keep top 10
  entries = entries.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(entries));
}

export function getLeaderboard(
  courseId: string,
  materialId: string
): QuizLeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const key = `${QUIZ_LEADERBOARD_KEY_PREFIX}${courseId}_${materialId}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function getQuizStats(
  courseId: string,
  materialId: string
): { attempts: number; avgScore: number; perfect: number } {
  if (typeof window === "undefined")
    return { attempts: 0, avgScore: 0, perfect: 0 };
  const leaderboard = getLeaderboard(courseId, materialId);
  const attempts = leaderboard.length;
  const totalScore = leaderboard.reduce((sum, e) => sum + e.score, 0);
  const perfect = leaderboard.filter(
    (e) => e.score === getQuiz(courseId, materialId).length
  ).length;
  return {
    attempts,
    avgScore:
      attempts > 0 ? Math.round((totalScore / attempts) * 100) / 100 : 0,
    perfect,
  };
}
