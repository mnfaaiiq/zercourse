"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ModeToggle } from "./toggle-mode";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-bold text-lg tracking-tight text-blue-700 dark:text-blue-400"
        >
          RoadmapCourse
        </Link>
        <div className="flex gap-4 text-sm font-medium items-center">
          <Link
            href="/courses"
            className="hover:text-blue-600 transition-colors"
          >
            Courses
          </Link>
          <Link href="/forum" className="hover:text-blue-600 transition-colors">
            Forum
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Admin
          </Link>
          <Link
            href="/profile"
            className="hover:text-blue-600 transition-colors"
          >
            Profile
          </Link>
          <SignedOut>
            <SignInButton>
              <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Login
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors">
                Register
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <div className="absolute right-1 top-3">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
