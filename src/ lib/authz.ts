import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser(role?: "PARENT" | "CHILD") {
  const session = await auth();
  if (!session?.user?.id || (role && session.user.role !== role)) return null;
  return session.user;
}

export async function parentOwnsChild(parentId: string, childUserId: string) {
  return Boolean(await prisma.parentChild.findUnique({ where: { parentId_childId: { parentId, childId: childUserId } } }));
}
