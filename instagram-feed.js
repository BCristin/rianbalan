const INSTAGRAM_FEED_URL = "/api/instagram";

function buildInstagramPost(post) {
  const link = document.createElement("a");
  link.className = "instagram-post";
  link.href = post.link;
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", `${post.alt} (opens Instagram)`);

  const img = document.createElement("img");
  img.src = post.image;
  img.alt = post.alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.addEventListener("error", () => link.remove());
  link.append(img);

  if (post.isVideo) {
    const badge = document.createElement("span");
    badge.className = "instagram-video";
    badge.textContent = "Video";
    link.append(badge);
  }
  return link;
}

async function loadInstagramFeed() {
  const grid = document.querySelector("[data-instagram-feed]");
  const section = grid?.closest("section");
  if (!grid || !section) return;

  try {
    const response = await fetch(INSTAGRAM_FEED_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const { posts = [] } = await response.json();
    if (posts.length === 0) return;
    grid.replaceChildren(...posts.map(buildInstagramPost));
    section.hidden = false;
  } catch {
    section.hidden = true;
  }
}

loadInstagramFeed();
