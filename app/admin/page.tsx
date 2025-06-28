import { courses } from "../../lib/courses";
import AdminPanelClient from "./AdminPanelClient";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You must be signed in to access the admin panel.
        </p>
      </main>
    );
  }

  // Get user object from Clerk
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Not authorized. Only admin can access this page.
        </p>
      </main>
    );
  }

  return <AdminPanelClient initialCourses={courses} />;
}
