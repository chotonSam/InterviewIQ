// Uploads an image straight from the browser to Cloudinary (unsigned preset) and returns its https URL.
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(file, maxMb = 3) {
  if (!ALLOWED.includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP image.");
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Image is too large (max ${maxMb} MB).`);
  if (!CLOUD || !PRESET) throw new Error("Cloudinary isn't configured. Check .env.local and restart the server.");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed.");
  return data.secure_url;
}
