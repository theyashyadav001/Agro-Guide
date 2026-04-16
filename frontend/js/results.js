/**
 * CropAdvisor — Results Page JavaScript
 * ======================================
 * Reads prediction data from sessionStorage and renders
 * crop recommendation cards with profit, risk, and metrics.
 */

// ── Crop emoji mapping ──
const CROP_ICONS = {
    rice: "🌾", maize: "🌽", chickpea: "🫘", kidneybeans: "🫘",
    pigeonpeas: "🫘", mothbeans: "🫘", mungbean: "🫘", blackgram: "🫘",
    lentil: "🫘", pomegranate: "🍎", banana: "🍌", mango: "🥭",
    grapes: "🍇", watermelon: "🍉", muskmelon: "🍈", apple: "🍎",
    orange: "🍊", papaya: "🍈", coconut: "🥥", cotton: "🏵️",
    jute: "🌿", coffee: "☕",
};

function getCropIcon(cropName) {
    return CROP_ICONS[cropName.toLowerCase()] || "🌱";
}

function formatCurrency(num) {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
}

// ═══════════════════════════════════════════════
// Load & Render Results
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    const raw = sessionStorage.getItem("cropResults");
    const inputRaw = sessionStorage.getItem("cropInput");

    if (!raw) {
        // No data — redirect back
        document.getElementById("loadingOverlay").classList.remove("active");
        document.getElementById("cropCards").innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding:60px 20px;">
                <div style="font-size:3rem; margin-bottom:16px;">🚫</div>
                <h2 style="margin-bottom:12px; color: var(--text-primary);">No Results Found</h2>
                <p style="color: var(--text-secondary); margin-bottom:24px;">Please complete the analysis form first.</p>
                <a href="index.html" class="btn btn-primary">Go to Analysis</a>
            </div>`;
        return;
    }

    const data = JSON.parse(raw);
    const input = inputRaw ? JSON.parse(inputRaw) : {};

    // Render summary chips
    renderSummaryChips(data.input_summary, input);

    // Render crop cards
    renderCropCards(data.recommendations);

    // Hide loading
    setTimeout(() => {
        document.getElementById("loadingOverlay").classList.remove("active");
    }, 500);
});

// ═══════════════════════════════════════════════
// Render Input Summary Chips
// ═══════════════════════════════════════════════

function renderSummaryChips(summary, input) {
    const container = document.getElementById("inputSummary");
    if (!summary) return;

    let html = "";
    if (summary.soil) {
        html += `<div class="summary-chip"><span class="icon">🧪</span>${summary.soil}</div>`;
    }
    if (summary.weather) {
        html += `<div class="summary-chip"><span class="icon">🌤️</span>${summary.weather}</div>`;
    }
    if (summary.farm) {
        html += `<div class="summary-chip"><span class="icon">🌾</span>${summary.farm}</div>`;
    }
    container.innerHTML = html;
}

// ═══════════════════════════════════════════════
// Render Crop Cards
// ═══════════════════════════════════════════════

function renderCropCards(recommendations) {
    const container = document.getElementById("cropCards");
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding:40px;">
                <p style="color: var(--text-secondary);">No recommendations available.</p>
            </div>`;
        return;
    }

    container.innerHTML = recommendations.map((rec, i) => {
        const icon = getCropIcon(rec.crop);
        const rankClass = `rank-${rec.rank}`;
        const profitMin = formatCurrency(rec.profit?.profit_range?.[0] || 0);
        const profitMax = formatCurrency(rec.profit?.profit_range?.[1] || 0);
        const riskLevel = rec.risk?.level || "medium";
        const waterReq = rec.water_requirement || "medium";
        const duration = rec.growing_duration_days || "N/A";
        const confidence = rec.confidence || 0;

        return `
        <div class="crop-card ${rankClass}" onclick="viewCropDetail(${i})" id="cropCard${i}">
            <div class="card-rank">#${rec.rank}</div>
            <div class="card-crop-icon">${icon}</div>
            <div class="card-crop-name">${rec.crop_display}</div>
            <div class="card-crop-hindi">${rec.hindi_name}</div>
            <div class="card-confidence">✨ ${confidence}% match</div>
            
            <div class="card-metrics">
                <div class="metric">
                    <div class="metric-icon">💰</div>
                    <div class="metric-value">${profitMin}–${profitMax}</div>
                    <div class="metric-label">Est. Profit</div>
                </div>
                <div class="metric">
                    <div class="metric-icon">⚠️</div>
                    <div class="metric-value"><span class="risk-badge ${riskLevel}">${riskLevel.toUpperCase()}</span></div>
                    <div class="metric-label">Risk Level</div>
                </div>
                <div class="metric">
                    <div class="metric-icon">💧</div>
                    <div class="metric-value">${waterReq}</div>
                    <div class="metric-label">Water Need</div>
                </div>
                <div class="metric">
                    <div class="metric-icon">📅</div>
                    <div class="metric-value">${duration}d</div>
                    <div class="metric-label">Duration</div>
                </div>
            </div>
            
            <div class="card-footer">
                <span class="card-season">📆 ${rec.season || ''}</span>
                <span class="card-detail-btn">View Details →</span>
            </div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════
// Navigate to Detail Page
// ═══════════════════════════════════════════════

function viewCropDetail(index) {
    const raw = sessionStorage.getItem("cropResults");
    if (!raw) return;
    
    const data = JSON.parse(raw);
    const crop = data.recommendations[index];
    
    // Store selected crop in sessionStorage
    sessionStorage.setItem("selectedCrop", JSON.stringify(crop));
    window.location.href = "detail.html";
}

// ── Toast helper ──
function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 4000);
}
