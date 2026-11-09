import { avatarUrl } from "@/lib/avatar";

export default function ProfileHeader({ profile }) {
  const { user, stats } = profile;
  const tiles = [
    { label: "Interviews", value: stats.interviews },
    { label: "Avg score", value: stats.avg ?? "—" },
    { label: "Best score", value: stats.best ?? "—" },
    { label: "Posts", value: stats.posts },
    { label: "Likes received", value: stats.likes },
    { label: "Resources", value: stats.resources },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-ink-line bg-ink-soft/40">
      <div className="h-28 bg-gradient-to-r from-indigo/50 via-indigo/15 to-signal-green/25 sm:h-36" />

      <div className="px-5 pb-6 sm:px-8">
        <div className="-mt-12 flex items-end gap-5 sm:-mt-14">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl(user.image, 240)} alt={`${user.name}'s picture`} className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-ink-soft sm:h-28 sm:w-28" />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo font-display text-5xl ring-4 ring-ink-soft sm:h-28 sm:w-28">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <h2 className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl leading-tight sm:text-4xl">
          {user.name}
          {user.verified && (
            <span className="rounded-full bg-signal-green/15 px-2.5 py-1 font-body text-xs font-medium text-signal-green" title="This person confirmed their email address">✓ Verified</span>
          )}
        </h2>
        <p className="mt-1 font-mono text-sm text-slate-muted">@{user.username} · Joined {user.joined}</p>
        {user.bio && <p className="mt-4 max-w-2xl leading-relaxed text-paper/90">{user.bio}</p>}

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-2xl border border-ink-line bg-ink/60 px-4 py-3">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-muted">{t.label}</dt>
              <dd className="mt-1 font-display text-2xl">{t.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
