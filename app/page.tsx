import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900 px-4 sm:px-8 py-12">
      <header className="flex flex-col items-center gap-4 mb-12">
        <Image
          src="/next.svg"
          alt="Logo"
          width={80}
          height={80}
          className="mb-2 dark:invert drop-shadow-lg transition-opacity duration-700 opacity-100"
        />
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tight transition-opacity duration-700 opacity-100">
          Become a Full Stack Web Developer
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl transition-opacity duration-700 opacity-100">
          Project-based, practical online learning platform for Gen-Z, career
          switchers, and beginners. Learn by doing, build real projects, and get
          ready for the tech industry!
        </p>
        <Link
          href="/auth/register"
          className="mt-4 inline-block px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Get Started For Free
        </Link>
      </header>
      <section className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
        {[
          {
            icon: "📱",
            title: "Mobile-First",
            desc: "Designed for seamless experience on any device.",
          },
          {
            icon: "🛠️",
            title: "Project-Based",
            desc: "Learn by building real-world projects and practical tasks.",
          },
          {
            icon: "💡",
            title: "Easy to Start",
            desc: "No prior experience needed. Start your journey today!",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 flex flex-col items-center group transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50/40 dark:hover:bg-blue-900/30 cursor-pointer"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {f.icon}
            </span>
            <h3 className="font-bold text-lg mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {f.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
              {f.desc}
            </p>
          </div>
        ))}
      </section>
      <footer className="text-gray-400 text-sm text-center mt-auto transition-opacity duration-700 opacity-100">
        &copy; {new Date().getFullYear()} Online Course Roadmap. Built with
        Next.js & TailwindCSS.
      </footer>
    </div>
  );
}
