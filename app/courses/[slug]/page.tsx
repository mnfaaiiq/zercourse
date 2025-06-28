"use client";

import { courses } from "../../../lib/courses";
import Image from "next/image";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";
import { useEffect, useState, use as useUnwrap } from "react";

function hasPurchased(courseId: string): boolean {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem("purchased_courses");
  if (!data) return false;
  try {
    return JSON.parse(data).includes(courseId);
  } catch {
    return false;
  }
}

function markPurchased(courseId: string) {
  if (typeof window === "undefined") return;
  let arr: string[] = [];
  try {
    arr = JSON.parse(localStorage.getItem("purchased_courses") || "[]");
  } catch {}
  if (!arr.includes(courseId)) {
    arr.push(courseId);
    localStorage.setItem("purchased_courses", JSON.stringify(arr));
  }
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = useUnwrap(params);
  const course = courses.find((c) => c.slug === slug);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("user_email") || undefined
      : undefined;

  useEffect(() => {
    if (course?.premium) {
      setPurchased(hasPurchased(course.id));
      if (searchParams?.get("success") === "1") {
        markPurchased(course.id);
        setPurchased(true);
        router.replace(`/courses/${slug}`);
      }
    }
  }, [course, searchParams, router, slug]);

  if (!course) return notFound();

  if (course.premium && !purchased) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center py-10 sm:py-16 px-2 sm:px-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 w-full max-w-2xl flex flex-col items-center border-2 border-yellow-400">
          <Image
            src={course.image}
            alt={course.title}
            width={80}
            height={80}
            className="mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold mb-2 text-center">
            {course.title}{" "}
            <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded align-middle">
              Premium
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {course.description}
          </p>
          <div className="text-yellow-700 dark:text-yellow-300 font-semibold mb-4">
            This is a premium course. Please purchase to access the content.
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ courseId: course.id, userEmail }),
                });
                const data = await res.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert("Failed to create Stripe session.");
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Redirecting..." : "Buy with Stripe"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex flex-col items-center py-10 sm:py-16 px-2 sm:px-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 w-full max-w-2xl flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <Image
          src={course.image}
          alt={course.title}
          width={80}
          height={80}
          className="mb-4 drop-shadow-lg"
        />
        <h1 className="text-3xl font-bold mb-2 text-center">{course.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {course.description}
        </p>
        <CourseDetailClient course={course} />
      </div>
    </main>
  );
}
