/**
 * AgroGuide — Main Application JavaScript
 */

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
    if (step > currentStep && !validateStep(currentStep)) return;
    currentStep = step;
    updateFormStep();
}

function updateFormStep() {
    document.querySelectorAll(".form-step").forEach(el => el.classList.remove("active"));
    const activeStep = document.getElementById(`step${currentStep}`);
    if (activeStep) activeStep.classList.add("active");

    document.querySelectorAll(".progress-step").forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove("active", "completed");
        if (s === currentStep) el.classList.add("active");
        if (s < currentStep) el.classList.add("completed");
    });

    const line = document.getElementById("progressLine");
    const totalSteps = 3;
    const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const maxWidth = document.querySelector(".progress-steps").offsetWidth - 80;
    line.style.width = `${(pct / 100) * maxWidth}px`;

    // Auto-detect location when user reaches Step 3
    if (currentStep === 3) {
        setTimeout(() => detectLocation(), 400);
    }
}

// ═══════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════

function validateStep(step) {
    if (step === 1) {
        const n  = document.getElementById("inputN").value;
        const p  = document.getElementById("inputP").value;
        const k  = document.getElementById("inputK").value;
        const ph = document.getElementById("inputPH").value;
        if (!n || !p || !k || !ph) { showToast("Please fill in all soil data fields", "error"); return false; }
        if (parseFloat(ph) < 0 || parseFloat(ph) > 14) { showToast("pH must be between 0 and 14", "error"); return false; }
        return true;
    }
    return true;
}

// ═══════════════════════════════════════════════
// Location & Weather — Fully Automatic
// ═══════════════════════════════════════════════

async function detectLocation() {
    const btn = document.getElementById("detectLocationBtn");
    if (!btn) return;

    // Show loading state
    btn.disabled = true;
    btn.classList.add("loading");
    btn.innerHTML = '<span class="loc-spinner"></span><span>Detecting location…</span>';

    // Hide any previous weather preview
    document.getElementById("weatherPreview").classList.remove("active");

    if (!navigator.geolocation) {
        showToast("Location required", "error");
        resetLocationBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;

            btn.innerHTML = '<span>🌐</span><span>Fetching weather…</span>';

            try {
                // Run geocoding + weather API in parallel (both free, no API key)
                const [geoRes, weatherRes] = await Promise.all([
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
                        headers: { "Accept-Language": "en" }
                    }),
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`)
                ]);

                const geoData     = await geoRes.json();
                const weatherData = await weatherRes.json();

                // Extract city name
                const addr = geoData.address || {};
                const city = addr.city || addr.town || addr.village
                    || addr.county || addr.state_district || addr.state || "Unknown";

                // Extract weather values
                const temp     = Math.round(weatherData.current.temperature_2m);
                const humidity = weatherData.current.relative_humidity_2m;
                const rainfall = weatherData.current.precipitation ?? 0;

                // ── Auto-fill all form fields ──
                document.getElementById("inputCity").value     = city;
                document.getElementById("inputTemp").value     = temp;
                document.getElementById("inputHumidity").value = humidity;
                document.getElementById("inputRainfall").value = rainfall;

                // ── Show weather preview card ──
                document.getElementById("wpTemp").textContent     = `${temp}°C`;
                document.getElementById("wpHumidity").textContent = `${humidity}%`;
                document.getElementById("wpRainfall").textContent = rainfall > 0 ? `${rainfall} mm` : "No rain";
                document.getElementById("weatherPreview").classList.add("active");

                showToast(`📍 ${city} · ${temp}°C · ${humidity}% humidity`, "success");

            } catch (_) {
                showToast("Unable to fetch weather data", "error");
            }

            resetLocationBtn();
        },
        (err) => {
            const msg = err.code === 1 ? "Location required" : "Unable to fetch weather data";
            showToast(msg, "error");
            resetLocationBtn();
        },
        { timeout: 12000, enableHighAccuracy: true }
    );
}

function resetLocationBtn() {
    const btn = document.getElementById("detectLocationBtn");
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.innerHTML = '<span>📍</span><span data-en="Auto-Detect My Location" data-hi="मेरा स्थान स्वतः पहचानें">Auto-Detect My Location</span>';
    if (currentLang === "hi") {
        btn.querySelector("[data-hi]").textContent = "मेरा स्थान स्वतः पहचानें";
    }
}

// Keep city-blur fallback via backend for manual entry
document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("inputCity");
    if (cityInput) {
        cityInput.addEventListener("blur", function () {
            if (this.value.trim()) fetchWeatherByCity(this.value.trim());
        });
    }
});

async function fetchWeatherByCity(city) {
    try {
        const res  = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data.success) {
            document.getElementById("inputTemp").value     = data.temperature;
            document.getElementById("inputHumidity").value = data.humidity;
            document.getElementById("inputRainfall").value = data.rainfall;
            document.getElementById("wpTemp").textContent     = `${data.temperature}°C`;
            document.getElementById("wpHumidity").textContent = `${data.humidity}%`;
            document.getElementById("wpRainfall").textContent = data.rainfall > 0 ? `${data.rainfall}mm` : "No rain";
            document.getElementById("weatherPreview").classList.add("active");
            showToast(`🌤️ Weather loaded for ${data.city || city}`, "success");
        }
    } catch (_) { /* silent – user can fill manually */ }
}

// ═══════════════════════════════════════════════
// Form Submission
// ═══════════════════════════════════════════════

async function submitForm() {
    if (!validateStep(1)) { nextStep(1); return; }

    const temp     = document.getElementById("inputTemp").value;
    const humidity = document.getElementById("inputHumidity").value;
    const rainfall = document.getElementById("inputRainfall").value;

    if (!temp || !humidity || !rainfall) {
        showToast("Please fill in weather data or detect location first", "error");
        return;
    }

    showLoading(true);

    const payload = {
        N: parseFloat(document.getElementById("inputN").value),
        P: parseFloat(document.getElementById("inputP").value),
        K: parseFloat(document.getElementById("inputK").value),
        temperature: parseFloat(temp),
        humidity:    parseFloat(humidity),
        ph:          parseFloat(document.getElementById("inputPH").value),
        rainfall:    parseFloat(rainfall),
        land_size:   parseFloat(document.getElementById("inputLand").value) || 2,
        budget:      parseFloat(document.getElementById("inputBudget").value) || 50000,
        water_availability: document.querySelector('input[name="water"]:checked')?.value || "medium",
        city: document.getElementById("inputCity").value || "",
    };

    try {
        const data = predictCrops(payload);

        if (data.success && data.recommendations.length > 0) {
            sessionStorage.setItem("cropResults", JSON.stringify(data));
            sessionStorage.setItem("cropInput",   JSON.stringify(payload));
            window.location.href = "results.html";
        } else {
            showLoading(false);
            showToast("No crop recommendations found. Try adjusting your inputs.", "error");
        }
    } catch (e) {
        showLoading(false);
        showToast(`Error: ${e.message}`, "error");
    }
}

// ═══════════════════════════════════════════════
// Language Toggle
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("langEn")?.addEventListener("click", () => switchLang("en"));
    document.getElementById("langHi")?.addEventListener("click", () => switchLang("hi"));
});

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(lang === "en" ? "langEn" : "langHi")?.classList.add("active");
    document.querySelectorAll("[data-en]").forEach(el => {
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
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("navbar");
        if (nav) nav.style.background = window.scrollY > 50
            ? "rgba(15,23,42,0.95)"
            : "rgba(15,23,42,0.75)";
    });
});
