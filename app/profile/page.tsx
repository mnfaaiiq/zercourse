"use client";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { getUserPoints, getUserLevel, getUserBadges } from "../../lib/utils";

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  if (!isSignedIn || !user) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sign in to view your profile.
        </p>
      </main>
    );
  }
  const badges = getUserBadges(user.id);
  const points = getUserPoints(user.id);
  const level = getUserLevel(user.id);
  return (
    <main className="min-h-[60vh] flex flex-col items-center py-10 sm:py-16 px-2 sm:px-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-lg flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <Image
            src={user.imageUrl || "/file.svg"}
            alt="Profile Picture"
            width={96}
            height={96}
            className="rounded-full border-4 border-blue-200 dark:border-blue-900 shadow mb-3"
          />
          <h2 className="text-2xl font-bold mb-1 text-center">
            {user.fullName ||
              user.username ||
              user.emailAddresses?.[0]?.emailAddress ||
              "User"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-1">
            {user.username && <span>@{user.username}</span>}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
            {user.emailAddresses?.[0]?.emailAddress}
          </p>
          <button className="mt-3 px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        </div>
        <div className="flex gap-4 justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg px-5 py-2 flex flex-col items-center">
            <span className="text-xs text-gray-500">Poin</span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {points}
            </span>
          </div>
          <div className="bg-green-100 dark:bg-green-900 rounded-lg px-5 py-2 flex flex-col items-center">
            <span className="text-xs text-gray-500">Level</span>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {level}
            </span>
          </div>
        </div>
        <div className="w-full flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">Badge & Achievement</h3>
          {badges.length === 0 ? (
            <span className="text-xs text-gray-400">Belum ada badge</span>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {badges.map((badge) => (
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
      </div>
    </main>
  );
}
