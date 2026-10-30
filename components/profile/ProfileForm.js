"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { avatarUrl } from "@/lib/avatar";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_MB = 2;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

async function patchProfile(body) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Could not save.");
  return data;
}

export default function ProfileForm({ user }) {
  const router = useRouter();
  const fileRef = useRef(null);

  const [image, setImage] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again later
    if (!file) return;

    setPhotoError("");
    if (!ALLOWED.includes(file.type)) return setPhotoError("Please choose a JPG, PNG or WebP image.");
    if (file.size > MAX_MB * 1024 * 1024) return setPhotoError(`Image is too large (max ${MAX_MB} MB).`);
    if (!CLOUD || !PRESET) return setPhotoError("Cloudinary isn't configured. Check .env.local and restart the server.");

    setUploading(true);
    try {
      // 1) Upload straight from the browser to Cloudinary (unsigned preset)
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed.");

      // 2) Save the picture's link on your account
      const saved = await patchProfile({ image: data.secure_url });
      setImage(saved.image);
      router.refresh(); // updates the sidebar picture
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setPhotoError("");
    setUploading(true);
    try {
      await patchProfile({ image: "" });
      setImage("");
      router.refresh();
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveDetails(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);
    try {
      const saved = await patchProfile({ name, phone });
      setName(saved.name);
      setPhone(saved.phone);
      setMessage({ type: "ok", text: "Profile saved." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Picture */}
      <section className="rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
        <h2 className="mb-5 font-medium">Profile picture</h2>
        <div className="flex flex-wrap items-center gap-6">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl(image, 192)} alt="Your profile picture" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo/30 font-display text-4xl">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="sr-only" id="avatar-file" />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
                {uploading ? "Uploading…" : image ? "Change picture" : "Upload picture"}
              </button>
              {image && !uploading && (
                <button type="button" onClick={removePhoto} className="focus-ring rounded px-2 py-2 text-sm text-slate-muted transition-colors hover:text-signal-red">
                  Remove
                </button>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-muted">JPG, PNG or WebP · up to {MAX_MB} MB</p>
            {photoError && <p role="alert" className="mt-3 text-sm text-signal-red">{photoError}</p>}
          </div>
        </div>
      </section>

      {/* Details */}
      <form onSubmit={saveDetails} className="space-y-5 rounded-2xl border border-ink-line bg-ink-soft/40 p-6">
        <h2 className="font-medium">Your details</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="p-name" className="mb-2 block text-sm font-medium">Full name</label>
            <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="field focus-ring" required />
          </div>
          <div>
            <label htmlFor="p-phone" className="mb-2 block text-sm font-medium">Phone</label>
            <input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="+880 1XXX XXXXXX" className="field focus-ring" />
          </div>
          <div>
            <label htmlFor="p-username" className="mb-2 block text-sm font-medium">Username</label>
            <input id="p-username" value={user.username} disabled className="field opacity-60" />
          </div>
          <div>
            <label htmlFor="p-email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="p-email" value={user.email} disabled className="field opacity-60" />
          </div>
        </div>
        <p className="text-xs text-slate-muted">Username and email can&apos;t be changed.</p>

        {message.text && (
          <p role={message.type === "error" ? "alert" : "status"} className={`text-sm ${message.type === "error" ? "text-signal-red" : "text-signal-green"}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
