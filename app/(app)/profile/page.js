import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionUserId } from "@/lib/session";
import { getProfileData } from "@/lib/profile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import LevelBadges from "@/components/profile/LevelBadges";
import ProfileActivity from "@/components/profile/ProfileActivity";

export const metadata = { title: "My profile — InterviewIQ" };

export default async function MyProfilePage() {
  const userId = await getSessionUserId();
  const profile = await getProfileData(userId);
  if (!profile) notFound();

  await connectDB();
  const priv = await User.findById(userId).select("email phone").lean(); // private details, only for the owner

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/90 backdrop-blur">
        <div className="flex h-16 items-center px-6 lg:px-10">
          <div>
            <p className="font-mono text-xs text-slate-muted">This is how others see you</p>
            <h1 className="mt-1 font-display text-2xl leading-none">My profile</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        <ProfileHeader profile={profile} />

        <details className="group rounded-2xl border border-ink-line bg-ink-soft/40 open:pb-6">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-2xl px-6 py-4 font-medium">
            <span>Edit profile</span>
            <span className="font-mono text-xs text-slate-muted group-open:hidden">Picture, name, bio, phone ▾</span>
            <span className="hidden font-mono text-xs text-slate-muted group-open:inline">Close ▴</span>
          </summary>
          <div className="px-4 sm:px-6">
            <ProfileForm
              user={{ name: profile.user.name, username: profile.user.username, email: priv?.email ?? "", phone: priv?.phone ?? "", image: profile.user.image, bio: profile.user.bio }}
            />
          </div>
        </details>

        <LevelBadges levels={profile.levels} name={profile.user.name} />
        <ProfileActivity posts={profile.posts} resources={profile.resources} isOwner name={profile.user.name} />
      </main>
    </>
  );
}
