const BOOKING_EMAIL = "rianbalanph@gmail.com";

function initLightbox() {
  const dialog = document.getElementById("lightbox");
  const frames = [...document.querySelectorAll(".frame")];
  if (!dialog || frames.length === 0) return;

  const img = dialog.querySelector("img");
  const caption = dialog.querySelector(".lightbox-caption");
  let current = 0;

  const show = (index) => {
    current = (index + frames.length) % frames.length;
    const frame = frames[current];
    const thumb = frame.querySelector("img");
    img.src = frame.dataset.full;
    img.alt = thumb.alt;
    caption.textContent = `${frame.nextElementSibling.textContent} · ${current + 1} / ${frames.length}`;
  };

  frames.forEach((frame, index) => {
    frame.addEventListener("click", () => {
      show(index);
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".prev").addEventListener("click", () => show(current - 1));
  dialog.querySelector(".next").addEventListener("click", () => show(current + 1));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
  dialog.addEventListener("close", () => frames[current].focus());
}

function initPackageLinks() {
  const select = document.querySelector('#booking-form select[name="package"]');
  if (!select) return;
  document.querySelectorAll("[data-package]").forEach((link) => {
    link.addEventListener("click", () => {
      select.value = link.dataset.package;
    });
  });
}

function buildMailto(data) {
  const subject = `Session request: ${data.get("package")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Package: ${data.get("package")}`,
    `Preferred date: ${data.get("date") || "not set"}`,
    "",
    data.get("message") || "",
  ].join("\n");
  return `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalid = [...form.querySelectorAll("[required]")].filter((field) => !field.checkValidity());
    form.querySelectorAll("[required]").forEach((field) => {
      field.setAttribute("aria-invalid", String(invalid.includes(field)));
    });

    if (invalid.length > 0) {
      status.classList.add("is-error");
      status.textContent = "Please enter your name and a valid email.";
      invalid[0].focus();
      return;
    }

    status.classList.remove("is-error");
    status.textContent = "Opening your email app with the request filled in.";
    window.location.href = buildMailto(new FormData(form));
  });
}

initLightbox();
initPackageLinks();
initBookingForm();
