export type Material = {
  id: string;
  title: string;
  content?: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  materials: Material[];
  premium?: boolean;
};

export const courses: Course[] = [
  {
    id: "1",
    slug: "web-fundamentals",
    title: "Web Fundamentals",
    description:
      "Learn the basics of HTML, CSS, and JavaScript to build your first website.",
    image: "/file.svg",
    materials: [
      { id: "m1", title: "Introduction to HTML" },
      { id: "m2", title: "CSS Basics" },
      { id: "m3", title: "JavaScript Essentials" },
    ],
    premium: false,
  },
  {
    id: "2",
    slug: "react-for-beginners",
    title: "React for Beginners",
    description:
      "A hands-on introduction to building interactive UIs with React.",
    image: "/next.svg",
    materials: [
      { id: "m1", title: "Getting Started with React" },
      { id: "m2", title: "JSX and Components" },
      { id: "m3", title: "State and Props" },
    ],
    premium: false,
  },
  {
    id: "3",
    slug: "fullstack-nextjs",
    title: "Fullstack Next.js",
    description:
      "Build scalable fullstack apps using Next.js, Prisma, and PostgreSQL.",
    image: "/globe.svg",
    materials: [
      { id: "m1", title: "Next.js Fundamentals" },
      { id: "m2", title: "API Routes & Database" },
      { id: "m3", title: "Deploying to Vercel" },
    ],
    premium: true,
  },
];
