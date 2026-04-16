/**
 * AgroGuide — Main Application JavaScript
 * ==========================================
 * Handles: multi-step form, language toggle, weather fetch,
 * geolocation, validation, and form submission to backend.
 */

// ── Config ──
// Update AGROGUIDE_API_URL after deploying backend to Railway/Render
const API_BASE = window.AGROGUIDE_API_URL || "https://agroguide-api.up.railway.app";

let currentStep = 1;
let currentLang = "en";

// ═══════════════════════════════════════════════
// Section Visibility
// ═══════════════════════════════════════════════

function showHero() {
    document.getElementById("heroSection").style.display = "flex";
    document.getElementById("formSection").classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showForm() {
    document.getElementById("heroSection").style.display = "none";
    document.getElementById("formSection").classList.add("active");
    currentStep = 1;
    updateFormStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ═══════════════════════════════════════════════
// Multi-Step Form Navigation
// ═══════════════════════════════════════════════

function nextStep(step) {
    // Validate current step before moving forward
    if (step > currentStep && !validateStep(currentStep)) {
        return;
    }
    currentStep = step;
    updateFormStep();
}

function updateFormStep() {
    // Update form steps visibility
    document.querySelectorAll(".form-step").forEach((el) => el.classList.remove("active"));
    const activeStep = document.getElementById(`step${currentStep}`);
    if (activeStep) activeStep.classList.add("active");

    // Update progress indicators
    document.querySelectorAll(".progress-step").forEach((el) => {
        const s = parseInt(el.dataset.step);
        el.classList.remove("active", "completed");
        if (s === currentStep) el.classList.add("active");
        if (s < currentStep) el.classList.add("completed");
    });

    // Update progress line width
    const line = document.getElementById("progressLine");
    const totalSteps = 3;
    const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const maxWidth = document.querySelector(".progress-steps").offsetWidth - 80; // account for padding
    line.style.width = `${(pct / 100) * maxWidth}px`;
}

// ═══════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════

function validateStep(step) {
    if (step === 1) {
        const n = document.getElementById("inputN").value;
        const p = document.getElementById("inputP").value;
        const k = document.getElementById("inputK").value;
        const ph = document.getElementById("inputPH").value;

        if (!n || !p || !k || !ph) {
            showToast("Please fill in all soil data fields", "error");
            return false;
        }
        if (parseFloat(ph) < 0 || parseFloat(ph) > 14) {
            showToast("pH must be between 0 and 14", "error");
            return false;
        }
        return true;
    }
    if (step === 2) {
        return true; // Farm details have defaults
    }
    return true;
}

// ═══════════════════════════════════════════════
// Weather & Location
// ═══════════════════════════════════════════════

async function detectLocation() {
    const btn = document.getElementById("detectLocationBtn");
    btn.classList.add("loading");
    btn.innerHTML = '<span>⏳</span> <span>Detecting...</span>';

    if (!navigator.geolocation) {
        showToast("Geolocation not supported by your browser", "error");
        resetLocationBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Call our location endpoint
                const res = await fetch(`${API_BASE}/location`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ latitude, longitude }),
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`📍 Detected: ${data.region}`, "success");
                }
            } catch (e) {
                console.log("Location API not available, using coords only");
            }

            // Try reverse geocoding with a free service
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const geoData = await geoRes.json();
                const city = geoData.address?.city || geoData.address?.town || geoData.address?.state_district || "";
                if (city) {
                    document.getElementById("inputCity").value = city;
                    fetchWeather(city);
                }
            } catch (e) {
                console.log("Reverse geocoding failed");
            }

            resetLocationBtn();
        },
        (err) => {
            showToast("Location access denied. Please enter city manually.", "error");
            resetLocationBtn();
        },
        { timeout: 10000 }
    );
}

function resetLocationBtn() {
    const btn = document.getElementById("detectLocationBtn");
    btn.classList.remove("loading");
    btn.innerHTML = '<span>📍</span> <span>Auto-Detect My Location</span>';
}

async function fetchWeather(city) {
    if (!city) return;

    try {
        const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await res.json();

        if (data.success) {
            // Fill form fields
            document.getElementById("inputTemp").value = data.temperature;
            document.getElementById("inputHumidity").value = data.humidity;
            document.getElementById("inputRainfall").value = data.rainfall;

            // Show weather preview
            document.getElementById("wpTemp").textContent = `${data.temperature}°C`;
            document.getElementById("wpHumidity").textContent = `${data.humidity}%`;
            document.getElementById("wpRainfall").textContent = `${data.rainfall}mm`;
            document.getElementById("weatherPreview").classList.add("active");

            showToast(`🌤️ Weather loaded for ${data.city || city}`, "success");
        }
    } catch (e) {
        console.error("Weather fetch failed:", e);
    }
}

// ── Fetch weather on city input blur ──
document.getElementById("inputCity").addEventListener("blur", function () {
    if (this.value.trim()) fetchWeather(this.value.trim());
});

// ═══════════════════════════════════════════════
// Form Submission
// ═══════════════════════════════════════════════

async function submitForm() {
    // Validate all steps
    if (!validateStep(1)) { nextStep(1); return; }

    // Check weather fields
    const temp = document.getElementById("inputTemp").value;
    const humidity = document.getElementById("inputHumidity").value;
    const rainfall = document.getElementById("inputRainfall").value;

    if (!temp || !humidity || !rainfall) {
        showToast("Please fill in weather data or enter a city to auto-fetch", "error");
        return;
    }

    // Show loading
    showLoading(true);

    // Build request payload
    const payload = {
        N: parseFloat(document.getElementById("inputN").value),
        P: parseFloat(document.getElementById("inputP").value),
        K: parseFloat(document.getElementById("inputK").value),
        temperature: parseFloat(temp),
        humidity: parseFloat(humidity),
        ph: parseFloat(document.getElementById("inputPH").value),
        rainfall: parseFloat(rainfall),
        land_size: parseFloat(document.getElementById("inputLand").value) || 2,
        budget: parseFloat(document.getElementById("inputBudget").value) || 50000,
        water_availability: document.querySelector('input[name="water"]:checked')?.value || "medium",
        city: document.getElementById("inputCity").value || "",
    };

    try {
        const res = await fetch(`${API_BASE}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Prediction failed");
        }

        const data = await res.json();

        if (data.success && data.recommendations.length > 0) {
            // Store results in sessionStorage and navigate
            sessionStorage.setItem("cropResults", JSON.stringify(data));
            sessionStorage.setItem("cropInput", JSON.stringify(payload));
            window.location.href = "results.html";
        } else {
            showLoading(false);
            showToast("No crop recommendations found. Try adjusting your inputs.", "error");
        }
    } catch (e) {
        showLoading(false);
        showToast(`Error: ${e.message}`, "error");
        console.error("Predict error:", e);
    }
}

// ═══════════════════════════════════════════════
// Language Toggle
// ═══════════════════════════════════════════════

document.getElementById("langEn").addEventListener("click", () => switchLang("en"));
document.getElementById("langHi").addEventListener("click", () => switchLang("hi"));

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
    document.getElementById(lang === "en" ? "langEn" : "langHi").classList.add("active");

    // Update all translatable elements
    document.querySelectorAll("[data-en]").forEach((el) => {
        el.textContent = el.getAttribute(`data-${lang}`) || el.getAttribute("data-en");
    });
}

// ═══════════════════════════════════════════════
// UI Helpers
// ═══════════════════════════════════════════════

function showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (show) overlay.classList.add("active");
    else overlay.classList.remove("active");
}

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 4000);
}

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
    updateFormStep();

    // Navbar scroll effect
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("navbar");
        if (window.scrollY > 50) nav.style.background = "rgba(15, 23, 42, 0.95)";
        else nav.style.background = "rgba(15, 23, 42, 0.75)";
    });
});
