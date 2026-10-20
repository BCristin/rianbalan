const GRAPH_URL = "https://graph.instagram.com/v26.0/me/media";
const FIELDS = "id,media_type,media_url,thumbnail_url,permalink,timestamp,alt_text";
const POST_LIMIT = 8;
const CACHE_OK = "public, s-maxage=3600, stale-while-revalidate=86400";
const CACHE_ERROR = "public, s-maxage=300";

export function toPost(item) {
  const image = item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;
  if (!image || !item.permalink) return null;
  return {
    id: item.id,
    image,
    link: item.permalink,
    isVideo: item.media_type === "VIDEO",
    alt: item.alt_text || "Instagram post by Rian Balan",
    date: item.timestamp,
  };
}

function json(body, status, cacheControl) {
  return Response.json(body, { status, headers: { "Cache-Control": cacheControl } });
}

export async function loadPosts(token, fetchImpl = fetch) {
  const url = new URL(GRAPH_URL);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(POST_LIMIT));
  url.searchParams.set("access_token", token);

  const response = await fetchImpl(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Instagram responded with ${response.status}`);
  }
  return (data.data || []).map(toPost).filter(Boolean);
}

export default {
  async fetch() {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return json({ posts: [], error: "Instagram is not connected" }, 503, CACHE_ERROR);

    try {
      return json({ posts: await loadPosts(token) }, 200, CACHE_OK);
    } catch (error) {
      console.error("Instagram feed failed:", error.message);
      return json({ posts: [], error: "Instagram feed unavailable" }, 502, CACHE_ERROR);
    }
  },
};
