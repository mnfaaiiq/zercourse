import { users } from "@clerk/clerk-sdk-node";

export async function listUsers() {
  const userList = await users.getUserList();
  return userList;
}

export async function setUserRole(userId: string, role: string) {
  await users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}
