// Cloudinary avatar helpers (work on both server and client)

// Adds a crop/resize transformation to a Cloudinary image URL so we load a small square face-focused image
export function avatarUrl(url, size = 96) {
  if (!url || !url.includes("/image/upload/")) return url || "";
  return url.replace("/image/upload/", `/image/upload/c_fill,g_face,w_${size},h_${size},f_auto,q_auto/`);
}

// Server-side check: only accept images that really live in OUR Cloudinary account
export function isValidAvatarUrl(url) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return (
    Boolean(cloud) &&
    typeof url === "string" &&
    url.length <= 500 &&
    !/\s/.test(url) &&
    url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`)
  );
}
