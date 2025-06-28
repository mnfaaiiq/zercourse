"use client";

import { useUser } from "@clerk/nextjs";
import {
  getEnrolledCourses,
  getCourseProgress,
  setCourseProgress,
} from "../../lib/enroll";
import { courses } from "../../lib/courses";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserQuizScore } from "../../lib/quiz";
import jsPDF from "jspdf";
import {
  getUserPoints,
  getUserLevel,
  getLevelProgress,
  getUserBadges,
  getLeaderboard,
  LeaderboardEntry,
} from "../../lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState({ current: 0, max: 100 });
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (user) {
      setEnrolled(getEnrolledCourses(user.id));
      // Load progress for each enrolled course
      const prog: Record<string, number> = {};
      getEnrolledCourses(user.id).forEach((courseId) => {
        const course = courses.find((c) => c.id === courseId);
        prog[courseId] = course
          ? getCourseProgress(user.id, courseId, course.materials.length)
          : 0;
      });
      setProgress(prog);
      // Ambil poin, level, dan progress level
      setUserPoints(getUserPoints(user.id));
      setUserLevel(getUserLevel(user.id));
      setLevelProgress(getLevelProgress(user.id));
      setUserBadges(getUserBadges(user.id));
      setLeaderboard(getLeaderboard());
    }
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sign in to view your enrolled courses and progress.
        </p>
      </main>
    );
  }

  const enrolledCourses = courses.filter((c) => enrolled.includes(c.id));

  const handleIncreaseProgress = (courseId: string) => {
    if (!user) return;
    const current = progress[courseId] || 0;
    const next = Math.min(100, current + 10);
    setCourseProgress(user.id, courseId, next);
    setProgress((prev) => ({ ...prev, [courseId]: next }));
  };

  const handleDownloadCertificate = (courseTitle: string) => {
    const doc = new jsPDF();
    const userName =
      user?.fullName ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "User";
    const date = new Date().toLocaleDateString();
    doc.setFontSize(22);
    doc.text("Certificate of Completion", 20, 30);
    doc.setFontSize(16);
    doc.text(`This certifies that`, 20, 50);
    doc.setFontSize(18);
    doc.text(userName, 20, 65);
    doc.setFontSize(16);
    doc.text(`has successfully completed the course:`, 20, 80);
    doc.setFontSize(18);
    doc.text(courseTitle, 20, 95);
    doc.setFontSize(14);
    doc.text(`Date: ${date}`, 20, 120);
    doc.setFontSize(12);
    doc.text("Online Course Roadmap", 20, 140);
    doc.save(`certificate-${courseTitle.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <main className="min-h-[60vh] flex flex-col items-center py-10 sm:py-16 px-2 sm:px-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <div className="mb-10 w-full max-w-2xl flex flex-col items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-xl px-7 py-4 flex flex-col items-center shadow-md">
            <span className="text-xs text-gray-500">Poin</span>
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {userPoints}
            </span>
          </div>
          <div className="bg-green-100 dark:bg-green-900 rounded-xl px-7 py-4 flex flex-col items-center shadow-md">
            <span className="text-xs text-gray-500">Level</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-300">
              {userLevel}
            </span>
          </div>
          <div className="flex flex-col items-center w-full max-w-xs">
            <span className="text-xs text-gray-500">
              Menuju Level Berikutnya
            </span>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded mt-1">
              <div
                className="h-2 bg-yellow-500 rounded transition-all"
                style={{
                  width: `${
                    (levelProgress.current / levelProgress.max) * 100
                  }%`,
                }}
              />
            </div>
            <span className="text-xs mt-1">
              {levelProgress.current} / {levelProgress.max} poin
            </span>
          </div>
        </div>
        {/* Badge/Achievement */}
        <div className="mt-8 w-full flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">Badge & Achievement</h3>
          {userBadges.length === 0 ? (
            <span className="text-xs text-gray-400">Belum ada badge</span>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {userBadges.map((badge) => (
                <span
                  key={badge}
                  className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 transition-transform"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Leaderboard */}
        <div className="mt-8 w-full flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">Leaderboard</h3>
          <ol className="w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow divide-y divide-gray-200 dark:divide-gray-800">
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <li key={entry.userId} className="flex items-center gap-2 py-2">
                <span className="font-mono w-6 text-center">{idx + 1}.</span>
                <span
                  className={`font-semibold ${
                    entry.userId === user.id
                      ? "text-blue-600 dark:text-blue-300"
                      : ""
                  }`}
                >
                  {entry.name}
                </span>
                <span className="ml-auto font-mono">{entry.points} pts</span>
                {entry.userId === user.id && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      {enrolledCourses.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          You have not enrolled in any courses yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all p-7 flex flex-col items-center group border border-gray-100 dark:border-gray-800 hover:-translate-y-1 cursor-pointer"
            >
              <Link
                href={`/courses/${course.slug}`}
                className="w-full flex flex-col items-center"
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  width={64}
                  height={64}
                  className="mb-4 group-hover:scale-110 transition-transform"
                />
                <h2 className="text-xl font-semibold mb-2 text-center group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-4">
                  {course.description}
                </p>
              </Link>
              <div className="w-full mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-500">
                    {progress[course.id] || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded transition-all"
                    style={{ width: `${progress[course.id] || 0}%` }}
                  />
                </div>
              </div>
              <div className="w-full mt-2">
                <h4 className="text-xs font-semibold mb-1">Quiz Scores</h4>
                <ul className="space-y-1">
                  {course.materials.map((m) => {
                    const score = getUserQuizScore(user.id, course.id, m.id);
                    return (
                      <li
                        key={m.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span>{m.title}:</span>
                        {score !== null ? (
                          <span className="font-mono">{score}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {score !== null && score === 1 && (
                          <span className="ml-1 bg-green-500 text-white px-2 py-0.5 rounded text-[10px]">
                            Perfect
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {progress[course.id] === 100 && (
                <button
                  className="mt-2 px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                  onClick={() => handleDownloadCertificate(course.title)}
                >
                  Download Certificate
                </button>
              )}
              <button
                onClick={() => handleIncreaseProgress(course.id)}
                className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                disabled={(progress[course.id] || 0) >= 100}
              >
                Mark Progress +10%
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
