// ─────────────────────────────────────────────
//  ASNYC RENTALS – services.js
//  Handles: enquiry modal, form validation,
//  table column highlight, localStorage read
// ─────────────────────────────────────────────

const STORAGE_KEY = "asnyc_user_profile";
const BOOKINGS_KEY = "asnyc_bookings";

// ── Initialise ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  prefillEnquiryForm();
  showWelcomeBanner();
  showBookingNotice();
  attachEnquiryListeners();
});

// ─────────────────────────────────────────────
//  PREFILL – reads name & phone from localStorage
//  so returning users don't retype their details
// ─────────────────────────────────────────────
function prefillEnquiryForm() {
  const saved = loadProfile();
  if (!saved) return;
  if (saved.fullName) {
    const nameField = document.getElementById("eq-name");
    if (nameField) nameField.value = saved.fullName;
  }
  if (saved.phone) {
    const phoneField = document.getElementById("eq-phone");
    if (phoneField) phoneField.value = saved.phone;
  }
}

// ─────────────────────────────────────────────
//  WELCOME BANNER – reads from localStorage
//  Greets returning users in the navbar
// ─────────────────────────────────────────────
function showWelcomeBanner() {
  const saved = loadProfile();
  if (!saved?.fullName) return;

  const firstName = saved.fullName.split(" ")[0];
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  const greeting = document.createElement("span");
  greeting.textContent = `👋 Welcome back, ${firstName}!`;
  greeting.style.cssText = "font-size:13px;color:#888;margin-left:1rem;";
  nav.appendChild(greeting);
}

// ─────────────────────────────────────────────
//  BOOKING NOTICE – reads bookings from localStorage
//  Shows a banner if the user has existing bookings
// ─────────────────────────────────────────────
function showBookingNotice() {
  const bookings = getBookings();
  if (!bookings.length) return;

  const latest = bookings[bookings.length - 1];
  const notice = document.createElement("div");
  notice.style.cssText =
    "background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 24px;" +
    "font-size:13px;color:#555;text-align:center;";
  notice.innerHTML =
    `📋 You have <strong>${bookings.length}</strong> booking(s) with us. ` +
    `Latest: <strong>${latest.car.name}</strong> — booked ${formatDate(latest.bookedAt)}.`;

  const nav = document.querySelector(".navbar");
  if (nav) nav.insertAdjacentElement("afterend", notice);
}

// ─────────────────────────────────────────────
//  EVENT LISTENERS – live clear errors on input
// ─────────────────────────────────────────────
function attachEnquiryListeners() {
  const fields = ["eq-name", "eq-phone", "eq-email"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => clearEnquiryError(id));
  });

  // Click overlay to close
  const modal = document.getElementById("enquiryModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEnquiry();
    });
  }

  // ESC key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEnquiry();
  });
}

// ─────────────────────────────────────────────
//  ENQUIRY MODAL – open / close
// ─────────────────────────────────────────────
function openEnquiry(serviceName) {
  // Update the modal header with the selected service
  const title = document.getElementById("enquiry-service-name");
  if (title) title.textContent = serviceName;

  // Reset errors from previous attempt
  resetEnquiryErrors();

  // Prefill name & phone each time it opens (in case user just booked)
  prefillEnquiryForm();

  const modal = document.getElementById("enquiryModal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => modal.classList.add("visible"));
  }
}

function closeEnquiry() {
  const modal = document.getElementById("enquiryModal");
  if (!modal) return;
  modal.classList.remove("visible");
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
}

// ─────────────────────────────────────────────
//  ENQUIRY FORM VALIDATION
// ─────────────────────────────────────────────
function submitEnquiry() {
  let valid = true;

  // Full name
  const name = document.getElementById("eq-name")?.value.trim() ?? "";
  if (!name) {
    showEnquiryError("eq-name", "eq-err-name");
    valid = false;
  }

  // Phone – at least 10 digits
  const phone =
    document.getElementById("eq-phone")?.value.replace(/\D/g, "") ?? "";
  if (phone.length < 10) {
    showEnquiryError("eq-phone", "eq-err-phone");
    valid = false;
  }

  // Email – basic format check
  const email = document.getElementById("eq-email")?.value.trim() ?? "";
  if (!email || !email.includes("@") || !email.includes(".")) {
    showEnquiryError("eq-email", "eq-err-email");
    valid = false;
  }

  if (!valid) return;

  // Save name & phone to localStorage so other pages can read them
  saveProfile({
    fullName: name,
    phone: document.getElementById("eq-phone").value.trim(),
    email,
  });

  closeEnquiry();

  alert(
    `✅ Thanks, ${name.split(" ")[0]}! Your enquiry has been sent. We'll be in touch soon.`,
  );
}

// ── Show / hide field errors ───────────────────
function showEnquiryError(fieldId, errId) {
  document.getElementById(fieldId)?.classList.add("input-error");
  const err = document.getElementById(errId);
  if (err) err.style.display = "block";
}

function clearEnquiryError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("input-error");
  const err = field.parentElement?.querySelector(".error-msg");
  if (err) err.style.display = "none";
}

function resetEnquiryErrors() {
  document
    .querySelectorAll(".error-msg")
    .forEach((el) => (el.style.display = "none"));
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
}

// ─────────────────────────────────────────────
//  COMPARISON TABLE – column highlight
//  Clicking a column header highlights that column
// ─────────────────────────────────────────────
function highlightColumn(colIndex) {
  const table = document.querySelector(".comparison-table");
  if (!table) return;

  // Get all cells in that column position across all rows
  const allCells = table.querySelectorAll(
    `td:nth-child(${colIndex + 1}), th:nth-child(${colIndex + 1})`,
  );

  // Check if this column is already highlighted — toggle it off if so
  const alreadyHighlighted = allCells[0]?.classList.contains("col-highlight");

  // Remove all highlights first
  table
    .querySelectorAll(".col-highlight")
    .forEach((el) => el.classList.remove("col-highlight"));

  // Apply highlight to clicked column (unless toggling off)
  if (!alreadyHighlighted) {
    allCells.forEach((cell) => cell.classList.add("col-highlight"));
  }
}

// ─────────────────────────────────────────────
//  LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────
function saveProfile(data) {
  const existing = loadProfile() || {};
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch (e) {
    console.warn("localStorage unavailable:", e);
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
