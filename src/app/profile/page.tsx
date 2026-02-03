import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);
  if (!session) redirect("/auth/login");

  return <ProfileClient user={session.user} />;
}
