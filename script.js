// ─────────────────────────────────────────────
//  ASNYC RENTALS – index.js
//  Handles: modal flow, form validation,
//  localStorage persistence, event listeners

const STORAGE_KEY = "asnyc_user_profile";
const BOOKINGS_KEY = "asnyc_bookings";

let currentCar = { name: "", code: "", price: "" };

let bookingForm, formCarName, formCarDetails;
let fullNameInput, phoneInput, pickupDateInput, returnDateInput, periodSelect;

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  cacheDOM();
  setMinDates();
  prefillSavedProfile();
  attachEventListeners();
  injectConfirmationModal();
  showWelcomeBanner();
});

//  Cache DOM nodes 
function cacheDOM() {
  bookingForm = document.getElementById("bookingform");
  formCarName = document.getElementById("form-car-name");
  formCarDetails = document.getElementById("form-car-details");
  fullNameInput = document.getElementById("fullName");
  phoneInput = document.getElementById("phone");
  pickupDateInput = document.getElementById("pickupDate");
  returnDateInput = document.getElementById("returnDate");
  periodSelect = document.getElementById("period");
}

//  Set minimum selectable dates 
function setMinDates() {
  const today = new Date().toISOString().split("T")[0];
  if (pickupDateInput) pickupDateInput.min = today;
  if (returnDateInput) returnDateInput.min = today;
}

// Prefill name & phone from localStorage 
function prefillSavedProfile() {
  const saved = loadProfile();
  if (!saved) return;
  if (fullNameInput && saved.fullName) fullNameInput.value = saved.fullName;
  if (phoneInput && saved.phone) phoneInput.value = saved.phone;
}

//  Attaching all event listeners 
function attachEventListeners() {
  // Push return date minimum forward when pickup changes
  if (pickupDateInput) {
    pickupDateInput.addEventListener("change", () => {
      if (returnDateInput) {
        returnDateInput.min = pickupDateInput.value;
        if (
          returnDateInput.value &&
          returnDateInput.value <= pickupDateInput.value
        ) {
          returnDateInput.value = "";
        }
      }
    });
  }

  // Clear field error as soon as user starts fixing it
  const fields = ["fullName", "phone", "pickupDate", "returnDate", "period"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => clearError(id));
      el.addEventListener("change", () => clearError(id));
    }
  });

  // Click the dark overlay to close the form
  if (bookingForm) {
    bookingForm.addEventListener("click", (e) => {
      if (e.target === bookingForm) closeform();
    });
  }

  // ESC key closes any open modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeform();
      closeModal("confirmationModal");
    }
  });
}

//  BOOKING FORM – open and close

function openModal(carName, carCode = "—", carPrice = "—") {
  currentCar = { name: carName, code: carCode, price: carPrice };

  if (formCarName) formCarName.textContent = carName;
  if (formCarDetails) formCarDetails.textContent = `${carCode} · ${carPrice}`;

  resetFormErrors();

  if (bookingForm) {
    bookingForm.style.display = "flex";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => bookingForm.classList.add("visible"));
  }
}

function closeform() {
  if (bookingForm) {
    bookingForm.classList.remove("visible");
    setTimeout(() => {
      bookingForm.style.display = "none";
      document.body.style.overflow = "";
    }, 300);
  }
}

// 
//  FORM VALIDATION AREA 
// 
function validateAndBook() {
  let valid = true;

  // Full name – needs first and last name
  const name = fullNameInput ? fullNameInput.value.trim() : "";
  if (!name || name.split(" ").length < 2) {
    showError("fullName", "err-name");
    valid = false;
  }

  // Phone – at least 10 digits
  const phone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
  if (phone.length < 10) {
    showError("phone", "err-phone");
    valid = false;
  }

  // Pick-up date
  const pickup = pickupDateInput ? pickupDateInput.value : "";
  if (!pickup) {
    showError("pickupDate", "err-pickup");
    valid = false;
  }

  // Return date – must be after pickup
  const ret = returnDateInput ? returnDateInput.value : "";
  if (!ret || ret <= pickup) {
    showError("returnDate", "err-return");
    valid = false;
  }

  // Rental period
  const period = periodSelect ? periodSelect.value : "";
  if (!period) {
    showError("period", "err-period");
    valid = false;
  }

  if (!valid) return;

  // Save name + phone to localStorage
  saveProfile({ fullName: name, phone: phoneInput.value.trim() });

  const bookingData = {
    car: currentCar,
    customer: { name, phone: phoneInput.value.trim() },
    pickup,
    returnDate: ret,
    period,
    notes: document.getElementById("notes")?.value.trim() || "",
  };

  closeform();
  openConfirmationModal(bookingData);
}

function showError(fieldId, errId) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.add("input-error");
  if (err) err.style.display = "block";
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("input-error");
  const err = field.parentElement.querySelector(".error-msg");
  if (err) err.style.display = "none";
}

function resetFormErrors() {
  document
    .querySelectorAll(".error-msg")
    .forEach((el) => (el.style.display = "none"));
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
}

// ─────────────────────────────────────────────
//  CONFIRMATION MODAL
//  Shows booking summary + DOB check
// ─────────────────────────────────────────────
function injectConfirmationModal() {
  if (document.getElementById("confirmationModal")) return;

  const html = `
  <div class="form-overlay" id="confirmationModal" style="display:none;">
    <div class="form" style="max-width:460px;">
      <button class="form-close" onclick="closeModal('confirmationModal')">✕</button>

      <div style="font-size:40px;text-align:center;margin-bottom:8px;">📋</div>
      <h2>Confirm Your Details</h2>
      <p style="font-size:13px;color:#888;margin:-4px 0 18px;">
        Review your booking before we confirm it.
      </p>

      <div id="conf-details"
           style="background:#f9f9f9;border-radius:12px;padding:16px;
                  font-size:14px;line-height:1.9;margin-bottom:20px;color:#333;">
      </div>

      <div class="form-group">
        <label for="dob">Date of Birth</label>
        <input type="date" id="dob" />
        <span class="error-msg" id="err-dob">
          You must be 18 or older to rent a vehicle.
        </span>
      </div>

      <button class="submit-btn" onclick="confirmBooking()">Confirm Booking ✓</button>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  // Pre-fill DOB if previously saved
  const saved = loadProfile();
  if (saved?.dob) document.getElementById("dob").value = saved.dob;

  // Clear DOB error on change
  document.getElementById("dob").addEventListener("change", () => {
    document.getElementById("dob").classList.remove("input-error");
    document.getElementById("err-dob").style.display = "none";
  });

  // Click overlay to close
  document
    .getElementById("confirmationModal")
    .addEventListener("click", (e) => {
      if (e.target.id === "confirmationModal") closeModal("confirmationModal");
    });
}

function openConfirmationModal(bookingData) {
  window._pendingBooking = bookingData;

  // color:#333 on every <p> overrides any global CSS tinting the text
  document.getElementById("conf-details").innerHTML = `
    <p style="margin:0 0 2px;color:#333"><strong>🚗 Vehicle:</strong> ${bookingData.car.name}</p>
    <p style="margin:0 0 2px;color:#333"><strong>👤 Name:</strong> ${bookingData.customer.name}</p>
    <p style="margin:0 0 2px;color:#333"><strong>📞 Phone:</strong> ${bookingData.customer.phone}</p>
    <p style="margin:0 0 2px;color:#333"><strong>📅 Pick-Up:</strong> ${formatDate(bookingData.pickup)}</p>
    <p style="margin:0 0 2px;color:#333"><strong>📅 Return:</strong> ${formatDate(bookingData.returnDate)}</p>
    <p style="margin:0;color:#333"><strong>🔄 Period:</strong> ${bookingData.period}</p>
    ${bookingData.notes ? `<p style="margin:4px 0 0;color:#333"><strong>📝 Notes:</strong> ${bookingData.notes}</p>` : ""}
  `;

  showOverlay("confirmationModal");
}

function confirmBooking() {
  const dobVal = document.getElementById("dob")?.value;

  if (!dobVal || !isAdult(dobVal)) {
    document.getElementById("dob").classList.add("input-error");
    document.getElementById("err-dob").style.display = "block";
    return;
  }

  // Save DOB to localStorage
  saveProfile({ dob: dobVal });

  // Save completed booking
  saveBooking({
    ...window._pendingBooking,
    bookedAt: new Date().toISOString(),
    id: generateId(),
  });

  closeModal("confirmationModal");

  // Simple success message
  const name = window._pendingBooking.customer.name.split(" ")[0];
  alert(`🎉 Booking confirmed, ${name}! We'll be in touch soon.`);
}

// ── 18+ age check ──────────────────────────────
function isAdult(dobString) {
  const dob = new Date(dobString);
  const now = new Date();
  const age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  return (
    age > 18 ||
    (age === 18 && (m > 0 || (m === 0 && now.getDate() >= dob.getDate())))
  );
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
//  OVERLAY HELPERS
// ─────────────────────────────────────────────
function showOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "flex";
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => el.classList.add("visible"));
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("visible");
  setTimeout(() => {
    el.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
}

// ─────────────────────────────────────────────
//  LOCAL STORAGE – Profile
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

// ─────────────────────────────────────────────
//  LOCAL STORAGE – Bookings
// ─────────────────────────────────────────────
function saveBooking(booking) {
  const all = getBookings();
  all.push(booking);
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("localStorage unavailable:", e);
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
  return new Date(str + "T00:00:00").toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function generateId() {
  return (
    "ASN-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}
