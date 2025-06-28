import { courses } from "../../lib/courses";
import Link from "next/link";
import Image from "next/image";

export default function CoursesPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center py-10 sm:py-16 px-2 sm:px-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all p-7 flex flex-col items-center group border border-gray-100 dark:border-gray-800 hover:-translate-y-1 cursor-pointer"
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
              {course.premium && (
                <span className="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded align-middle">
                  Premium
                </span>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
              {course.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
