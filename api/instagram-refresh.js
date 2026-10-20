const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";
const SECONDS_PER_DAY = 86400;

export function isAuthorized(authHeader, cronSecret) {
  return Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;
}

export async function refreshToken(token, fetchImpl = fetch) {
  const url = new URL(REFRESH_URL);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const response = await fetchImpl(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message || `Instagram responded with ${response.status}`);
  }
  return {
    expiresInDays: Math.floor((data.expires_in || 0) / SECONDS_PER_DAY),
    tokenChanged: data.access_token !== token,
  };
}

export default {
  async fetch(request) {
    if (!isAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
      return Response.json({ ok: false }, { status: 401 });
    }

    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return Response.json({ ok: false, error: "Instagram is not connected" }, { status: 503 });

    try {
      const result = await refreshToken(token);
      if (result.tokenChanged) {
        console.warn("Instagram returned a new token string. Update INSTAGRAM_ACCESS_TOKEN in Vercel.");
      }
      console.log(`Instagram token refreshed, valid for ${result.expiresInDays} more days.`);
      return Response.json({ ok: true, ...result });
    } catch (error) {
      console.error("Instagram token refresh failed:", error.message);
      return Response.json({ ok: false, error: "Refresh failed" }, { status: 502 });
    }
  },
};
