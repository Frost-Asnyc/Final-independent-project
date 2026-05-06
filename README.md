# 🏎️ ASNYC Rentals LTD

## 📝 Project Description

**ASNYC Rentals Ltd** is a high-end web application built for the elite traveler in the African continent. The platform showcases an "eye-dropping" curated fleet of luxury vehicles—ranging from executive SUVs like the **Audi RSQ8** to high-performance sports cars like the **RS7 Sportback**.

The site provides a seamless user experience, allowing clients to browse premium vehicles with transparent daily and monthly pricing, and an integrated booking system for instant reservations.

## 🚀 Key Features

- **Premium Fleet Gallery:** Handpicked selection of vehicles with detailed specs (Seats, CC, Fuel Type, and Transmission).
- **Dynamic Booking System:** An interactive form overlay that captures user details, pick-up/return dates, and custom notes.
- **Responsive Luxury UI:** A "dark mode" aesthetic designed with **Poppins** and **Bebas Neue** typography for a premium feel.
- **Live Stats:** Real-time counters showcasing 50+ vehicles and 2,000+ happy clients.

---

## 🛠 Set-up and Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, or Edge).
- Live Server extension (recommended for the best experience).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Frost-Asnyc/Final-Independant-project.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd Final-Independant-project
    ```
3.  **Launch:**
    Simply open `index.html` in your browser.

---

## 🧪 BDD (Behavior-Driven Development)

| **Fleet Navigation** | User is on the Hero section | They click "Browse Fleet" | The page smooth-scrolls to the `#fleet` section |
| **Reservation Modal** | User finds a car (e.g., Audi RSQ8) | They click "Book Now" | A modal pops up pre-filled with the car name and price |
| **Form Validation** | User leaves the name field empty | They click "Confirm Booking" | An error message "Please enter your full name" appears |
| **Date Logic** | User selects a return date before a pick-up date | They attempt to submit | An error message prevents the submission |

---

## 💻 Technology Used

- **HTML5:** Structured using semantic elements for accessibility and SEO.
- **CSS3:** Custom properties (variables) for the gold (`#f5c518`) and dark themes, including Flexbox and Grid layouts.
- **JavaScript (ES6):**
  - **Modal Logic:** `openModal()` and `closeform()` functions for UI interaction.
  - **Validation:** Custom logic to ensure phone numbers and dates are valid before submission.
- **FontAwesome:** Used for high-quality vector icons (cars, users, calendars).

---

## 📂 Project Structure

```text
class_buisness/
├── index.html       # Main landing page & booking modal
├── about.html       # Company history & team biography
├── services.html    # Detailed list of rental services
├── style.css        # Premium UI styling and animations
├── script.js        # Form validation and modal logic
└── *.jpg / *.webp   # High-resolution vehicle imagery
```

---

## 👤 Author

**LERIONKA OLENTIKI**

- **Project:** ASNYC Rentals Ltd
- **Date:** May 2026

---

## 📜 License

Copyright © 2026 **ASNYC Rentals Ltd**.
This project is for educational purposes. All rights reserved.
