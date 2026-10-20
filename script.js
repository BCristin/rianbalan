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

function initDatePicker() {
  const input = document.querySelector(".js-date");
  if (!input || typeof flatpickr !== "function") return;
  flatpickr(input, {
    altInput: true,
    altFormat: "j F Y",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: false,
  });
}

function buildPayload(data) {
  return {
    _subject: `New photo session request: ${data.get("package")}`,
    _template: "table",
    _captcha: "false",
    _replyto: data.get("email"),
    Name: data.get("name"),
    Email: data.get("email"),
    Package: data.get("package"),
    "Preferred date": data.get("date") || "Not set",
    Message: data.get("message") || "",
  };
}

async function sendBooking(payload) {
  const response = await fetch(`https://formsubmit.co/ajax/${BOOKING_EMAIL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || String(result.success) !== "true") {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }
}

function setStatus(status, text, isError) {
  status.classList.toggle("is-error", isError);
  status.textContent = text;
}

function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const required = [...form.querySelectorAll("[required]")];
    const invalid = required.filter((field) => !field.checkValidity());
    required.forEach((field) => field.setAttribute("aria-invalid", String(invalid.includes(field))));

    if (invalid.length > 0) {
      setStatus(status, "Please enter your name and a valid email.", true);
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    if (data.get("_honey")) return;

    submit.disabled = true;
    setStatus(status, "Sending your request…", false);
    try {
      await sendBooking(buildPayload(data));
      form.reset();
      form.querySelector(".js-date")?._flatpickr?.clear();
      setStatus(status, "Thank you. Your request was sent and I will reply by email soon.", false);
    } catch (error) {
      console.error(error);
      setStatus(status, `Your request could not be sent. Please email me at ${BOOKING_EMAIL}.`, true);
    } finally {
      submit.disabled = false;
    }
  });
}

initLightbox();
initPackageLinks();
initDatePicker();
initBookingForm();
