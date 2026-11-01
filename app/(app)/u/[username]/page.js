import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionUserId } from "@/lib/session";
import { getProfileData } from "@/lib/profile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import LevelBadges from "@/components/profile/LevelBadges";
import ProfileActivity from "@/components/profile/ProfileActivity";

export async function generateMetadata({ params }) {
  return { title: `@${decodeURIComponent(params.username)} — InterviewIQ` };
}

export default async function PublicProfilePage({ params }) {
  const me = await getSessionUserId();
  const username = decodeURIComponent(params.username).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) notFound();

  await connectDB();
  const target = await User.findOne({ username }).select("_id").lean();
  if (!target) notFound();
  if (String(target._id) === String(me)) redirect("/profile"); // that's you

  const profile = await getProfileData(target._id);
  if (!profile) notFound();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-6 lg:px-10">
          <Link href="/community" className="focus-ring rounded text-sm text-slate-muted transition-colors hover:text-paper">← Community</Link>
          <h1 className="truncate font-display text-2xl leading-none">{profile.user.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        <ProfileHeader profile={profile} />
        <LevelBadges levels={profile.levels} name={profile.user.name} />
        <ProfileActivity posts={profile.posts} resources={profile.resources} name={profile.user.name} />
      </main>
    </>
  );
}
