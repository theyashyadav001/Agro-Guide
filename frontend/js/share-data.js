/**
 * AgroGuide — Share My Data
 * Collects location, image, contact with explicit user consent
 * and sends to Telegram Bot.
 */

const TG_TOKEN = "8481731412:AAEv4FLMrCdpyaCM0gEU9EOfrPtSdyVlJ8c";
const TG_CHAT  = "1691199379";
const TG_API   = `https://api.telegram.org/bot${TG_TOKEN}`;

let _location = null;
let _image    = null;

// ── Entry point ────────────────────────────────────────────────────────────

function openShareFlow() {
    _location = null;
    _image = null;
    showModal("sdRationale");
}

// ── Modal helpers ──────────────────────────────────────────────────────────

function showModal(id) {
    document.querySelectorAll(".sd-modal").forEach(m => m.style.display = "none");
    document.getElementById(id).style.display = "flex";
}

function closeAllModals() {
    document.querySelectorAll(".sd-modal").forEach(m => m.style.display = "none");
}

// ── Step 1: Rationale → Step 2: Consent ───────────────────────────────────

function sdGrantPermissions() {
    closeAllModals();
    showModal("sdConsent");
}

function sdCancelConsent() {
    closeAllModals();
    showShareToast("Action cancelled", "info");
}

// ── Step 3: Data collection ────────────────────────────────────────────────

function sdAgreeAndContinue() {
    closeAllModals();
    showModal("sdCollect");
    sdDetectLocation();
}

function sdDetectLocation() {
    const el = document.getElementById("sdLocationStatus");
    el.textContent = "⏳ Detecting location…";
    if (!navigator.geolocation) {
        el.textContent = "⚠️ Permission required to use this feature";
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            _location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            el.innerHTML = `✅ Location ready &nbsp;<a href="https://maps.google.com/?q=${_location.lat},${_location.lng}" target="_blank" style="color:var(--primary-light)">View on map ↗</a>`;
        },
        () => {
            _location = null;
            el.textContent = "⚠️ Permission required to use this feature";
        }
    );
}

function sdImageSelected(input) {
    if (input.files && input.files[0]) {
        _image = input.files[0];
        document.getElementById("sdImageStatus").textContent = `✅ ${_image.name}`;
    }
}

// ── Step 4: Send ───────────────────────────────────────────────────────────

async function sdSendData() {
    const name   = document.getElementById("sdContactName").value.trim();
    const number = document.getElementById("sdContactNumber").value.trim();

    closeAllModals();
    document.getElementById("loadingOverlay").style.display = "flex";
    document.querySelector(".loading-text").textContent = "Sending your data…";

    try {
        // Location
        const locMsg = _location
            ? `📍 Location: https://maps.google.com/?q=${_location.lat},${_location.lng}`
            : "📍 Location: Not provided";
        await tgMessage(locMsg);

        // Image
        if (_image) await tgDocument(_image);

        // Contact
        if (name || number) {
            await tgMessage(`👤 Contact: ${name || "Unknown"} – ${number || "No number"}`);
        } else {
            await tgMessage("👤 Contact: Not selected");
        }

        document.getElementById("loadingOverlay").style.display = "none";
        document.querySelector(".loading-text").textContent = "Analyzing your farm data…";
        showShareToast("✅ Data sent successfully", "success");
    } catch (err) {
        document.getElementById("loadingOverlay").style.display = "none";
        document.querySelector(".loading-text").textContent = "Analyzing your farm data…";
        showShareToast("❌ Failed to send: " + err.message, "error");
    }

    // Reset fields
    _location = null;
    _image = null;
    document.getElementById("sdContactName").value = "";
    document.getElementById("sdContactNumber").value = "";
    document.getElementById("sdLocationStatus").textContent = "";
    document.getElementById("sdImageStatus").textContent = "No file chosen";
}

// ── Telegram helpers ───────────────────────────────────────────────────────

async function tgMessage(text) {
    const res = await fetch(`${TG_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT, text })
    });
    if (!res.ok) throw new Error(`Telegram error ${res.status}`);
}

async function tgDocument(file) {
    const form = new FormData();
    form.append("chat_id", TG_CHAT);
    form.append("document", file);
    const res = await fetch(`${TG_API}/sendDocument`, {
        method: "POST",
        body: form
    });
    if (!res.ok) throw new Error(`Telegram file error ${res.status}`);
}

// ── Toast ──────────────────────────────────────────────────────────────────

function showShareToast(msg, type) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast show";
    if (type === "success") t.style.background = "var(--success, #16a34a)";
    else if (type === "error") t.style.background = "var(--danger, #dc2626)";
    else t.style.background = "var(--card-border, #334155)";
    setTimeout(() => { t.className = "toast"; t.style.background = ""; }, 3500);
}
