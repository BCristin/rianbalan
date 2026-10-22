const COOKIE_NOTICE_KEY = "cookie-notice-accepted";

function readNoticeAccepted() {
  try {
    return localStorage.getItem(COOKIE_NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveNoticeAccepted() {
  try {
    localStorage.setItem(COOKIE_NOTICE_KEY, "1");
  } catch {}
}

function buildCookieNotice() {
  const notice = document.createElement("div");
  notice.className = "cookie-notice";
  notice.setAttribute("role", "region");
  notice.setAttribute("aria-label", "Cookie notice");

  const text = document.createElement("p");
  text.append(
    "Our website uses cookies to improve the site's performance, efficiency and convenience. By continuing to use the site, you agree to the use of cookies. ",
  );
  const link = document.createElement("a");
  link.href = "privacy.html#cookies";
  link.textContent = "Privacy Policy";
  text.append(link);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-solid";
  button.textContent = "OK";
  button.addEventListener("click", () => {
    saveNoticeAccepted();
    notice.classList.add("is-leaving");
    Promise.allSettled(notice.getAnimations().map((animation) => animation.finished)).then(() => notice.remove());
  });

  notice.append(text, button);
  return notice;
}

function initCookieNotice() {
  if (readNoticeAccepted()) return;
  document.body.append(buildCookieNotice());
}

initCookieNotice();
