/**
 * CropAdvisor — Detail Page JavaScript
 * =====================================
 * Renders full crop detail view with timeline,
 * risk analysis, and profit projections.
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

function getCropIcon(name) {
    return CROP_ICONS[name?.toLowerCase()] || "🌱";
}

function formatCurrency(num) {
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
}

// ═══════════════════════════════════════════════
// Load & Render Detail
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    const raw = sessionStorage.getItem("selectedCrop");

    if (!raw) {
        document.getElementById("loadingOverlay").classList.remove("active");
        document.getElementById("detailHero").innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <div style="font-size:3rem; margin-bottom:16px;">🚫</div>
                <h2 style="margin-bottom:12px;">No Crop Selected</h2>
                <p style="color: var(--text-secondary); margin-bottom:24px;">Go back to results to select a crop.</p>
                <a href="index.html" class="btn btn-primary">Go to Analysis</a>
            </div>`;
        document.getElementById("timelineSection").style.display = "none";
        document.getElementById("riskSection").style.display = "none";
        document.getElementById("profitSection").style.display = "none";
        return;
    }

    const crop = JSON.parse(raw);

    // Update page title
    document.title = `🌾 ${crop.crop_display} — CropAdvisor`;

    // Render all sections
    renderHero(crop);
    renderTimeline(crop);
    renderRisk(crop);
    renderProfit(crop);

    // Hide loading
    setTimeout(() => {
        document.getElementById("loadingOverlay").classList.remove("active");
    }, 400);
});

// ═══════════════════════════════════════════════
// Hero Card
// ═══════════════════════════════════════════════

function renderHero(crop) {
    const icon = getCropIcon(crop.crop);
    const container = document.getElementById("detailHero");

    container.innerHTML = `
        <div class="detail-top">
            <div class="detail-crop-icon">${icon}</div>
            <div class="detail-info">
                <h1>${crop.crop_display}</h1>
                <div class="hindi">${crop.hindi_name}</div>
                <p class="description">${crop.description}</p>
            </div>
        </div>
        <div class="detail-stats">
            <div class="detail-stat">
                <div class="stat-icon">📅</div>
                <div class="stat-val">${crop.growing_duration_days} days</div>
                <div class="stat-lbl">Growing Duration</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">💧</div>
                <div class="stat-val">${crop.water_requirement?.toUpperCase()}</div>
                <div class="stat-lbl">Water Need</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">🌡️</div>
                <div class="stat-val">${crop.water_liters_per_acre?.toLocaleString()} L</div>
                <div class="stat-lbl">Water / Acre</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">🌿</div>
                <div class="stat-val">${crop.soil_type || 'General'}</div>
                <div class="stat-lbl">Soil Type</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">📆</div>
                <div class="stat-val">${crop.season || 'Multi-season'}</div>
                <div class="stat-lbl">Best Season</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">✨</div>
                <div class="stat-val">${crop.confidence}%</div>
                <div class="stat-lbl">AI Confidence</div>
            </div>
        </div>
        ${crop.best_states ? `
        <div style="margin-top: 20px; padding: 16px; background: var(--bg-input); border-radius: var(--radius-md);">
            <span style="font-size: 0.85rem; color: var(--text-muted);">📍 Best Grown In:</span>
            <span style="color: var(--text-secondary); font-size: 0.9rem;"> ${crop.best_states.join(', ')}</span>
        </div>` : ''}
    `;
}

// ═══════════════════════════════════════════════
// Timeline
// ═══════════════════════════════════════════════

function renderTimeline(crop) {
    const timeline = crop.timeline;
    if (!timeline || timeline.length === 0) {
        document.getElementById("timelineSection").style.display = "none";
        return;
    }

    const container = document.getElementById("timelineContent");
    container.innerHTML = timeline.map((item) => `
        <div class="timeline-item">
            <div class="timeline-week">Week ${item.week}</div>
            <div class="timeline-activity">${item.activity}</div>
        </div>
    `).join("");
}

// ═══════════════════════════════════════════════
// Risk Analysis
// ═══════════════════════════════════════════════

function renderRisk(crop) {
    const risk = crop.risk;
    if (!risk) {
        document.getElementById("riskSection").style.display = "none";
        return;
    }

    const container = document.getElementById("riskContent");
    const level = risk.level || "medium";
    const score = risk.score || 50;

    let riskColor = "var(--success)";
    if (level === "medium") riskColor = "var(--warning)";
    if (level === "high") riskColor = "var(--danger)";

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="risk-badge ${level}">${level.toUpperCase()} RISK</span>
            <span style="font-size: 1.2rem; font-weight: 700; color: ${riskColor};">${score}/100</span>
        </div>
        <div class="risk-meter">
            <div class="risk-fill ${level}" style="width: ${score}%;"></div>
        </div>
        ${risk.factors && risk.factors.length > 0 ? `
            <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 20px; margin-bottom: 8px;">⚠️ Risk Factors</h3>
            <ul class="risk-factors-list">
                ${risk.factors.map(f => `<li><span>⚡</span> ${f}</li>`).join("")}
            </ul>
        ` : ''}
        ${risk.crop_risks && risk.crop_risks.length > 0 ? `
            <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 20px; margin-bottom: 8px;">🐛 Common Crop Risks</h3>
            <ul class="risk-factors-list">
                ${risk.crop_risks.map(r => `<li><span>🔸</span> ${r.replace(/_/g, ' ')}</li>`).join("")}
            </ul>
        ` : ''}
    `;
}

// ═══════════════════════════════════════════════
// Profit Projection
// ═══════════════════════════════════════════════

function renderProfit(crop) {
    const profit = crop.profit;
    if (!profit) {
        document.getElementById("profitSection").style.display = "none";
        return;
    }

    const container = document.getElementById("profitContent");
    const cost = profit.total_cost || 0;
    const revenueMax = profit.revenue_range?.[1] || 0;
    const profitMax = profit.profit_range?.[1] || 0;
    const maxVal = Math.max(cost, revenueMax, 1);

    const costPct = (cost / maxVal) * 100;
    const revenuePct = (revenueMax / maxVal) * 100;
    const profitPct = Math.min(Math.max((profitMax / maxVal) * 100, 5), 100);

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div class="detail-stat">
                <div class="stat-icon">📊</div>
                <div class="stat-val" style="color: var(--danger);">${formatCurrency(cost)}</div>
                <div class="stat-lbl">Total Cost</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">📈</div>
                <div class="stat-val" style="color: var(--primary-light);">${formatCurrency(profit.revenue_range?.[0] || 0)} – ${formatCurrency(revenueMax)}</div>
                <div class="stat-lbl">Revenue Range</div>
            </div>
            <div class="detail-stat">
                <div class="stat-icon">💰</div>
                <div class="stat-val" style="color: var(--accent);">${formatCurrency(profit.profit_range?.[0] || 0)} – ${formatCurrency(profitMax)}</div>
                <div class="stat-lbl">Net Profit</div>
            </div>
        </div>

        <div class="profit-bar-container">
            <div class="profit-bar-item">
                <div class="profit-bar-label">💸 Cost</div>
                <div class="profit-bar">
                    <div class="profit-bar-fill cost" style="width: ${costPct}%;">${formatCurrency(cost)}</div>
                </div>
            </div>
            <div class="profit-bar-item">
                <div class="profit-bar-label">📈 Revenue</div>
                <div class="profit-bar">
                    <div class="profit-bar-fill revenue" style="width: ${revenuePct}%;">${formatCurrency(revenueMax)}</div>
                </div>
            </div>
            <div class="profit-bar-item">
                <div class="profit-bar-label">💰 Profit</div>
                <div class="profit-bar">
                    <div class="profit-bar-fill profit" style="width: ${profitPct}%;">${formatCurrency(profitMax)}</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">📊 Per-Acre Breakdown</div>
            <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                <div>
                    <span style="color: var(--text-secondary);">Yield:</span>
                    <span style="font-weight: 600; color: var(--text-primary);"> ${profit.expected_yield_kg?.toLocaleString() || 'N/A'} kg</span>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">Profit/Acre:</span>
                    <span style="font-weight: 600; color: var(--accent);"> ${formatCurrency(profit.profit_per_acre?.[0] || 0)} – ${formatCurrency(profit.profit_per_acre?.[1] || 0)}</span>
                </div>
            </div>
        </div>
    `;
}
