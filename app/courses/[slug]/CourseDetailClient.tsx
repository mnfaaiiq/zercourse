"use client";

import { useUser } from "@clerk/nextjs";
import {
  getEnrolledCourses,
  enrollCourse,
  getMaterialProgress,
  setMaterialProgress,
  getCourseProgress,
} from "../../../lib/enroll";
import { useEffect, useState } from "react";
import { Course } from "../../../lib/courses";
import { getComments, addComment, Comment } from "../../../lib/comments";
import {
  getQuiz,
  getUserQuizScore,
  setUserQuizScore,
  QuizQuestion,
  getLeaderboard,
  QuizLeaderboardEntry,
  getQuizStats,
} from "../../../lib/quiz";
import {
  addUserPoints,
  addUserBadge,
  getUserBadges,
  updateLeaderboard,
  getUserPoints,
} from "../../../lib/utils";

function CommentSection({
  courseId,
  materialId,
  user,
  canComment,
}: {
  courseId: string;
  materialId: string;
  user: {
    fullName?: string | null;
    username?: string | null;
    emailAddresses?: { emailAddress: string }[];
  } | null;
  canComment: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    setComments(getComments(courseId, materialId));
  }, [courseId, materialId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    addComment(
      courseId,
      materialId,
      user.fullName ||
        user.username ||
        user.emailAddresses?.[0]?.emailAddress ||
        "User",
      text.trim()
    );
    setComments(getComments(courseId, materialId));
    setText("");
  };

  return (
    <div className="mt-4 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded">
      <h4 className="font-semibold mb-2 text-sm">Comments</h4>
      <ul className="space-y-2 mb-2 max-h-40 overflow-y-auto">
        {comments.length === 0 && (
          <li className="text-xs text-gray-400">No comments yet.</li>
        )}
        {comments.map((c, i) => (
          <li key={i} className="text-xs">
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {c.user}
            </span>
            : {c.text}
            <span className="ml-2 text-gray-400">
              {new Date(c.date).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      {canComment && (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            className="border rounded px-2 py-1 text-xs flex-1"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

function QuizSection({
  courseId,
  materialId,
  user,
  canQuiz,
}: {
  courseId: string;
  materialId: string;
  user: {
    id: string;
    fullName?: string | null;
    username?: string | null;
    emailAddresses?: { emailAddress: string }[];
  } | null;
  canQuiz: boolean;
}) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean[] } | null>(null);
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [stats, setStats] = useState<{
    attempts: number;
    avgScore: number;
    perfect: number;
  }>({ attempts: 0, avgScore: 0, perfect: 0 });
  useEffect(() => {
    setQuiz(getQuiz(courseId, materialId));
    if (user) {
      setScore(getUserQuizScore(user.id, courseId, materialId));
    }
    setLeaderboard(getLeaderboard(courseId, materialId));
    setStats(getQuizStats(courseId, materialId));
  }, [courseId, materialId, user]);

  const currentUserName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  const handleAnswer = (idx: number, optIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = optIdx;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    let correct = 0;
    const fb: boolean[] = [];
    quiz.forEach((q, i) => {
      const isCorrect = answers[i] === q.answer;
      fb[i] = isCorrect;
      if (isCorrect) correct++;
    });
    setUserQuizScore(user.id, courseId, materialId, correct, currentUserName);
    setScore(correct);
    setFeedback({ correct: fb });
    setLeaderboard(getLeaderboard(courseId, materialId));
    // Auto-mark material as completed if all correct
    if (correct === quiz.length) {
      setMaterialProgress(user.id, courseId, materialId, true);
    }
    // Tambah poin jika quiz sudah pernah belum dapat poin
    if (correct > 0) {
      const key = `quiz_point_${courseId}_${materialId}_${user.id}`;
      if (!localStorage.getItem(key)) {
        addUserPoints(user.id, 30);
        localStorage.setItem(key, "1");
        // Update leaderboard
        const userName =
          user.fullName ||
          user.username ||
          user.emailAddresses?.[0]?.emailAddress ||
          "User";
        updateLeaderboard(user.id, userName, getUserPoints(user.id));
        // Badge quiz sempurna
        if (correct === quiz.length) {
          addUserBadge(user.id, "Quiz Sempurna!");
        }
      }
    }
  };

  const handleRetake = () => {
    setAnswers([]);
    setScore(null);
    setFeedback(null);
  };

  if (!canQuiz || quiz.length === 0) return null;

  return (
    <div className="mt-2 mb-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
      <h4 className="font-semibold mb-2 text-sm">Quiz</h4>
      {score !== null ? (
        <>
          <div
            className={`text-sm mb-2 ${
              score === quiz.length
                ? "text-green-700 dark:text-green-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            Your score: {score} / {quiz.length}
            {score === quiz.length && (
              <span className="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                Perfect!
              </span>
            )}
          </div>
          <ul className="mb-2 space-y-2">
            {quiz.map((q, i) => (
              <li key={i}>
                <div className="font-medium text-xs mb-1">{q.question}</div>
                <div className="flex flex-col gap-1">
                  {q.options.map((opt, j) => {
                    const isSelected = answers[i] === j;
                    const isCorrect = feedback?.correct[i] && q.answer === j;
                    const isWrong = isSelected && !isCorrect;
                    return (
                      <div
                        key={j}
                        className={`text-xs px-2 py-1 rounded ${
                          isCorrect
                            ? "bg-green-200 dark:bg-green-800"
                            : isWrong
                            ? "bg-red-200 dark:bg-red-800"
                            : ""
                        }`}
                      >
                        <input type="radio" checked={isSelected} readOnly />{" "}
                        {opt}
                        {isCorrect && (
                          <span className="ml-2 text-green-700 dark:text-green-300">
                            Correct
                          </span>
                        )}
                        {isWrong && (
                          <span className="ml-2 text-red-700 dark:text-red-300">
                            Incorrect
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
          {score !== quiz.length && (
            <button
              onClick={handleRetake}
              className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
            >
              Retake Quiz
            </button>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {quiz.map((q, i) => (
            <div key={i}>
              <div className="mb-1 font-medium text-xs">{q.question}</div>
              <div className="flex flex-col gap-1">
                {q.options.map((opt, j) => (
                  <label key={j} className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === j}
                      onChange={() => handleAnswer(i, j)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Submit Quiz
          </button>
        </form>
      )}
      {/* Leaderboard */}
      <div className="mt-4">
        <h5 className="font-semibold text-xs mb-1">Leaderboard</h5>
        <ol className="text-xs space-y-1">
          {leaderboard.length === 0 && (
            <li className="text-gray-400">No entries yet.</li>
          )}
          {leaderboard.slice(0, 5).map((entry, idx) => (
            <li key={idx} className="flex gap-2 items-center">
              <span className="font-mono w-4">{idx + 1}.</span>
              <span className="font-semibold">{entry.user}</span>
              <span className="ml-auto">{entry.score}</span>
              <span className="text-gray-400 ml-2">
                {new Date(entry.date).toLocaleDateString()}
              </span>
              {score !== null && entry.user === currentUserName && (
                <span className="ml-2 text-green-600">(You)</span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 text-xs text-gray-700 dark:text-gray-300">
        <div>
          Attempts: <span className="font-semibold">{stats.attempts}</span>
        </div>
        <div>
          Average Score: <span className="font-semibold">{stats.avgScore}</span>
        </div>
        <div>
          Perfect Scores: <span className="font-semibold">{stats.perfect}</span>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailClient({ course }: { course: Course }) {
  const { user } = useUser();
  const [enrolled, setEnrolled] = useState(false);
  const [materialStatus, setMaterialStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user && course) {
      const enrolledCourses = getEnrolledCourses(user.id);
      setEnrolled(enrolledCourses.includes(course.id));
      // Load material progress
      const status: Record<string, boolean> = {};
      course.materials.forEach((m) => {
        status[m.id] = getMaterialProgress(user.id, course.id, m.id);
      });
      setMaterialStatus(status);
      setProgress(
        getCourseProgress(user.id, course.id, course.materials.length)
      );
    }
  }, [user, course]);

  const handleEnroll = () => {
    if (user && course) {
      enrollCourse(user.id, course.id);
      setEnrolled(true);
    }
  };

  const handleMaterialCheck = (materialId: string, checked: boolean) => {
    if (!user || !course) return;
    setMaterialProgress(user.id, course.id, materialId, checked);
    setMaterialStatus((prev) => ({ ...prev, [materialId]: checked }));
    // update progress
    const newProgress = getCourseProgress(
      user.id,
      course.id,
      course.materials.length
    );
    setProgress(newProgress);
    // Tambah poin jika materi baru saja diselesaikan
    if (checked) {
      // Cek apakah user sudah pernah dapat poin untuk materi ini
      const key = `mat_point_${course.id}_${materialId}_${user.id}`;
      if (!localStorage.getItem(key)) {
        addUserPoints(user.id, 20);
        localStorage.setItem(key, "1");
        // Update leaderboard
        const userName =
          user.fullName ||
          user.username ||
          user.emailAddresses?.[0]?.emailAddress ||
          "User";
        updateLeaderboard(user.id, userName, getUserPoints(user.id));
        // Badge kursus pertama
        const allBadges = getUserBadges(user.id);
        const firstBadgeKey = "Kursus Pertama!";
        if (allBadges.length === 0) {
          addUserBadge(user.id, firstBadgeKey);
        }
        // Badge kursus tuntas (jika semua materi sudah selesai)
        const allDone = course.materials.every((m) =>
          getMaterialProgress(user.id, course.id, m.id)
        );
        if (allDone) {
          addUserBadge(user.id, "Kursus Tuntas!");
        }
      }
    }
  };

  return (
    <>
      {/* Progress bar */}
      {user && enrolled && (
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded">
            <div
              className="h-2 bg-blue-500 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
        <span className="text-gray-400">[Video Embed Placeholder]</span>
      </div>
      {user ? (
        enrolled ? (
          <>
            <button
              className="px-6 py-2 rounded bg-green-600 text-white font-semibold cursor-default mb-6"
              disabled
            >
              Enrolled
            </button>
            {/* Materials list */}
            <div className="w-full">
              <h3 className="font-semibold mb-2">Materials</h3>
              <ul className="space-y-2">
                {course.materials.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col gap-1 border-b pb-2 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!materialStatus[m.id]}
                        onChange={(e) =>
                          handleMaterialCheck(m.id, e.target.checked)
                        }
                        className="accent-blue-600 w-4 h-4"
                        id={`mat-${m.id}`}
                      />
                      <label
                        htmlFor={`mat-${m.id}`}
                        className="text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        {m.title}
                      </label>
                    </div>
                    <QuizSection
                      courseId={course.id}
                      materialId={m.id}
                      user={user}
                      canQuiz={!!user && enrolled}
                    />
                    <CommentSection
                      courseId={course.id}
                      materialId={m.id}
                      user={user}
                      canComment={!!user && enrolled}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <button
            onClick={handleEnroll}
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Enroll
          </button>
        )
      ) : (
        <span className="text-gray-400">Please sign in to enroll.</span>
      )}
    </>
  );
}
