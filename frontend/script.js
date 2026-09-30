/**
 * Student Tech Hub - Frontend Script
 * Plain Vanilla JavaScript for interacting with the FastAPI backend.
 */

// Configuration: Base URL of our FastAPI backend
const API_BASE_URL = "http://127.0.0.1:8000";

// DOM Elements
const loadEventsBtn = document.getElementById("load-events-btn");
const eventsContainer = document.getElementById("events-container");
const registrationForm = document.getElementById("registration-form");
const nameInput = document.getElementById("student-name");
const emailInput = document.getElementById("student-email");
const submitBtn = document.getElementById("submit-btn");
const feedbackAlert = document.getElementById("feedback-alert");
const backendStatusPill = document.getElementById("backend-status");

// -----------------------------------------------------------------------------
// 1. Backend Connectivity & Health Check
// -----------------------------------------------------------------------------

/**
 * Checks if the FastAPI backend is running and updates the UI status pill.
 */
async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (response.ok) {
      updateStatusBadge(true, "Backend Connected");
    } else {
      updateStatusBadge(false, "Backend Error");
    }
  } catch (error) {
    // This happens if the backend server is not running or blocked
    updateStatusBadge(false, "Backend Offline");
  }
}

/**
 * Helper to update the status badge appearance in the header.
 */
function updateStatusBadge(isConnected, message) {
  backendStatusPill.className = "backend-status-pill " + (isConnected ? "connected" : "disconnected");
  backendStatusPill.innerHTML = `
    <span class="status-dot"></span>
    <span class="status-text">${message}</span>
  `;
}

// -----------------------------------------------------------------------------
// 2. Fetch and Display Upcoming Events (GET /api/events)
// -----------------------------------------------------------------------------

/**
 * Loads events from the FastAPI backend and renders them to the page.
 */
async function loadEvents() {
  // Show loading state on the button
  loadEventsBtn.disabled = true;
  loadEventsBtn.innerHTML = `
    <span class="btn-icon">⏳</span>
    <span class="btn-text">Loading Events...</span>
  `;

  // Show temporary loading indicator in container
  eventsContainer.innerHTML = `
    <div class="placeholder-card">
      <div class="placeholder-icon">🔄</div>
      <h3>Fetching events from backend...</h3>
      <p>Connecting to <code>${API_BASE_URL}/api/events</code></p>
    </div>
  `;

  try {
    // Send GET request to FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/events`);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || [];

    // Render the retrieved events
    renderEvents(events);
    updateStatusBadge(true, "Backend Connected");

  } catch (error) {
    console.error("Failed to load events:", error);
    updateStatusBadge(false, "Backend Offline");

    // Display a beginner-friendly error card with troubleshooting steps
    eventsContainer.innerHTML = `
      <div class="placeholder-card" style="border-color: var(--danger); background: var(--danger-light);">
        <div class="placeholder-icon">⚠️</div>
        <h3 style="color: var(--danger);">Could not connect to the Backend</h3>
        <p style="margin-bottom: 0.75rem;">
          Make sure your FastAPI server is running on <strong>http://127.0.0.1:8000</strong>.
        </p>
        <p style="font-size: 0.85rem; color: #475569;">
          <em>Terminal command:</em> <code>uvicorn main:app --reload</code> inside the <code>backend/</code> folder.
        </p>
      </div>
    `;
  } finally {
    // Reset button back to normal state
    loadEventsBtn.disabled = false;
    loadEventsBtn.innerHTML = `
      <span class="btn-icon">⚡</span>
      <span class="btn-text">Refresh Events</span>
    `;
  }
}

/**
 * Creates HTML cards for each event and inserts them into the DOM.
 */
function renderEvents(events) {
  if (events.length === 0) {
    eventsContainer.innerHTML = `
      <div class="placeholder-card">
        <div class="placeholder-icon">📭</div>
        <h3>No upcoming events</h3>
        <p>Check back later for new workshops and sessions.</p>
      </div>
    `;
    return;
  }

  // Generate cards HTML
  const cardsHtml = events.map(event => `
    <article class="event-card">
      <div class="event-card-top">
        <h3 class="event-title">${escapeHtml(event.title)}</h3>
        <span class="category-tag">${escapeHtml(event.category || 'General')}</span>
      </div>

      <div class="event-meta">
        <span class="meta-item">
          📅 <strong>${escapeHtml(event.date)}</strong>
        </span>
        <span class="meta-item">
          ⏰ ${escapeHtml(event.time)}
        </span>
        <span class="meta-item">
          📍 ${escapeHtml(event.location)}
        </span>
      </div>

      <p class="event-desc">${escapeHtml(event.description)}</p>

      ${event.speaker ? `
        <div class="event-speaker">
          🎤 Speaker: ${escapeHtml(event.speaker)}
        </div>
      ` : ''}
    </article>
  `).join("");

  eventsContainer.innerHTML = cardsHtml;
}

// -----------------------------------------------------------------------------
// 3. Student Registration Form Submission (POST /api/register)
// -----------------------------------------------------------------------------

/**
 * Handles the registration form submission.
 */
async function handleRegistration(e) {
  // Prevent default browser form refresh
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  // Basic client-side validation
  if (!name) {
    showAlert("Please enter your full name.", "danger");
    nameInput.focus();
    return;
  }

  if (!email || !email.includes("@")) {
    showAlert("Please enter a valid student email address.", "danger");
    emailInput.focus();
    return;
  }

  // Set loading state on the submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="btn-icon">⏳</span>
    <span class="btn-text">Submitting...</span>
  `;

  try {
    // Send POST request with JSON payload to FastAPI
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Registration was successful
      showAlert(`🎉 ${result.message}`, "success");
      registrationForm.reset();
      updateStatusBadge(true, "Backend Connected");
    } else {
      // Backend returned an error response (e.g. 400 Bad Request)
      const errorMsg = result.detail || result.message || "Failed to register. Please check your information.";
      showAlert(`⚠️ ${errorMsg}`, "danger");
    }

  } catch (error) {
    console.error("Registration error:", error);
    showAlert("❌ Unable to connect to the backend server. Is FastAPI running on port 8000?", "danger");
    updateStatusBadge(false, "Backend Offline");
  } finally {
    // Re-enable the submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span class="btn-icon">✍️</span>
      <span class="btn-text">Register Now</span>
    `;
  }
}

/**
 * Displays an alert message box above the form.
 * @param {string} message - The message to display.
 * @param {'success' | 'danger' | 'info'} type - The alert styling category.
 */
function showAlert(message, type = "info") {
  feedbackAlert.className = `alert alert-${type}`;
  feedbackAlert.innerHTML = message;
  feedbackAlert.classList.remove("hidden");

  // Scroll smoothly to alert so the student sees the confirmation
  feedbackAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Escapes HTML characters to prevent XSS issues when rendering strings.
 */
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// -----------------------------------------------------------------------------
// 4. Event Listeners & Initial Page Setup
// -----------------------------------------------------------------------------

// Handle click on "Load Events" button
loadEventsBtn.addEventListener("click", loadEvents);

// Handle registration form submit
registrationForm.addEventListener("submit", handleRegistration);

// On initial page load: check connection and attempt to load events if backend is already running
window.addEventListener("DOMContentLoaded", () => {
  checkBackendConnection();
});
