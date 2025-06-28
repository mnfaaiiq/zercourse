import { listUsers, setUserRole } from "../../../lib/clerkAdmin";
import { auth, currentUser } from "@clerk/nextjs/server";
import UserManagementClient from "./UserManagementClient";

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You must be signed in to access this page.
        </p>
      </main>
    );
  }
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!isAdmin) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Not authorized. Only admin can access this page.
        </p>
      </main>
    );
  }

  const users = await listUsers();

  async function updateRoleAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    try {
      await setUserRole(userId, role);
      return { ok: true, message: "Role updated successfully." };
    } catch {
      return { ok: false, message: "Failed to update role." };
    }
  }

  return (
    <UserManagementClient users={users} updateRoleAction={updateRoleAction} />
  );
}
