import type { DefaultSession } from "next-auth";
import "next-auth";
declare module "next-auth" {
  interface Session { user: { id: string; role: "PARENT" | "CHILD" } & DefaultSession["user"] }
  interface User { role?: "PARENT" | "CHILD" }
}
declare module "next-auth/jwt" { interface JWT { role?: "PARENT" | "CHILD" } }
