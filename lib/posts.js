// One place that turns a Post document into the JSON the UI uses (list, single page, ...)
export function serializePost(p, userId, likedSet) {
  return {
    id: String(p._id),
    author: p.user?.name ?? "Unknown",
    username: p.user?.username ?? "",
    authorImage: p.user?.image ?? "",
    mine: String(p.user?._id) === String(userId),
    title: p.title,
    body: p.body,
    tag: p.tag,
    createdAt: new Date(p.createdAt).toISOString(),
    likes: p.likeCount,
    comments: p.commentCount,
    liked: likedSet.has(String(p._id)),
  };
}
