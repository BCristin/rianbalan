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
    ...(data.get("email") ? { _replyto: data.get("email") } : {}),
    Name: data.get("name"),
    Email: data.get("email") || "Not given",
    Phone: data.get("phone") || "Not given",
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

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return /^[+\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
}

function findInvalidField(form) {
  const name = form.elements.name;
  const email = form.elements.email;
  const phone = form.elements.phone;
  const emailValue = email.value.trim();
  const phoneValue = phone.value.trim();

  if (!name.value.trim()) return { field: name, message: "Please enter your name." };
  if (!emailValue && !phoneValue) return { field: email, message: "Please add your email or phone number.", also: phone };
  if (emailValue && !email.checkValidity()) return { field: email, message: "Please check your email address." };
  if (phoneValue && !isValidPhone(phoneValue)) return { field: phone, message: "Please check your phone number." };
  return null;
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
    const checked = [form.elements.name, form.elements.email, form.elements.phone];
    const problem = findInvalidField(form);
    checked.forEach((field) => {
      const isInvalid = problem !== null && (field === problem.field || field === problem.also);
      field.setAttribute("aria-invalid", String(isInvalid));
    });

    if (problem) {
      setStatus(status, problem.message, true);
      problem.field.focus();
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
      setStatus(status, "Thank you. Your request was sent and I will get back to you soon.", false);
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
