"use client";

import { useState, useTransition } from "react";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses?: { emailAddress: string }[];
  publicMetadata?: { role?: string };
}

export default function UserManagementClient({
  users,
  updateRoleAction,
}: {
  users: User[];
  updateRoleAction: (
    formData: FormData
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.firstName + " " + u.lastName).toLowerCase().includes(q) ||
      (u.emailAddresses?.[0]?.emailAddress || "").toLowerCase().includes(q)
    );
  });

  async function handleUpdateRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await updateRoleAction(formData);
        setNotif({ type: res.ok ? "success" : "error", message: res.message });
      } catch {
        setNotif({ type: "error", message: "Failed to update role." });
      }
      setTimeout(() => setNotif(null), 3000);
    });
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <input
        className="border rounded px-3 py-2 mb-4 w-full"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {notif && (
        <div
          className={`mb-4 px-4 py-2 rounded ${
            notif.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {notif.message}
        </div>
      )}
      <table className="w-full border rounded bg-white dark:bg-gray-900">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">
                {u.firstName} {u.lastName}
              </td>
              <td className="p-2">{u.emailAddresses?.[0]?.emailAddress}</td>
              <td className="p-2">{u.publicMetadata?.role || "user"}</td>
              <td className="p-2">
                <form
                  onSubmit={handleUpdateRole}
                  className="flex gap-2 items-center"
                >
                  <input type="hidden" name="userId" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.publicMetadata?.role || "user"}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 text-sm"
                    disabled={isPending}
                  >
                    Update
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
