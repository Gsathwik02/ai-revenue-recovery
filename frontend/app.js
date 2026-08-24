const API_URL = "https://ai-revenue-recovery-backend.onrender.com";

let recoveryData = [];

async function loadRecoveryAnalysis() {
    const app = document.querySelector(".container");

    try {
        const response = await fetch(`${API_URL}/recovery-analysis`);

        if (!response.ok) {
            throw new Error("Failed to load recovery analysis");
        }

        recoveryData = await response.json();

        renderDashboard(recoveryData);

        console.log("Recovery analysis loaded:", recoveryData);

    } catch (error) {
        console.error("Error:", error);

        if (app) {
            app.innerHTML += `
                <div class="error-box">
                    ⚠️ Unable to load recovery analysis.
                    Please try again.
                </div>
            `;
        }
    }
}

function renderDashboard(data) {
    const container = document.querySelector(".container");

    if (!container) return;

    const totalAmount = data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const highRisk = data.filter(
        item => String(item.risk_level).toUpperCase() === "HIGH"
    ).length;

    const mediumRisk = data.filter(
        item => String(item.risk_level).toUpperCase() === "MODERATE"
    ).length;

    const lowRisk = data.filter(
        item => String(item.risk_level).toUpperCase() === "LOW"
    ).length;

    const rows = data.map(item => `
        <tr>
            <td>${item.transaction_id || "-"}</td>
            <td>${item.customer_id || "-"}</td>
            <td>₹${Number(item.amount || 0).toLocaleString("en-IN")}</td>
            <td>${item.days_overdue ?? 0}</td>

            <td>
                <span class="risk ${String(item.risk_level).toLowerCase()}">
                    ${item.risk_level || "-"}
                </span>
            </td>

            <td>${item.recovery_score ?? "-"}</td>

            <td>
                <span class="priority">
                    ${item.priority || "-"}
                </span>
            </td>

            <td>${item.recommended_action || "-"}</td>
        </tr>
    `).join("");

    const existingDashboard =
        document.querySelector(".recovery-dashboard");

    if (existingDashboard) {
        existingDashboard.remove();
    }

    const dashboard = document.createElement("section");

    dashboard.className = "recovery-dashboard";

    dashboard.innerHTML = `
        <div class="stats-grid">

            <div class="stat-card">
                <h3>Total Pending Amount</h3>
                <strong>
                    ₹${totalAmount.toLocaleString("en-IN")}
                </strong>
            </div>

            <div class="stat-card">
                <h3>Total Transactions</h3>
                <strong>${data.length}</strong>
            </div>

            <div class="stat-card">
                <h3>High Risk</h3>
                <strong>${highRisk}</strong>
            </div>

            <div class="stat-card">
                <h3>Moderate Risk</h3>
                <strong>${mediumRisk}</strong>
            </div>

            <div class="stat-card">
                <h3>Low Risk</h3>
                <strong>${lowRisk}</strong>
            </div>

        </div>

        <div class="table-section">

            <div class="section-heading">
                <h2>AI Recovery Analysis</h2>
                <span>${data.length} accounts analyzed</span>
            </div>

            <div class="table-wrapper">

                <table>

                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Overdue</th>
                            <th>Risk</th>
                            <th>Score</th>
                            <th>Priority</th>
                            <th>Recommended Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

        </div>

        <div class="recommendations">

            <h2>AI Recovery Recommendations</h2>

            ${data.slice(0, 6).map(item => `
                <div class="recommendation-card">

                    <div>
                        <strong>
                            ${item.customer_id || "Customer"}
                        </strong>

                        <p>
                            ${item.ai_recommendation || "No recommendation available."}
                        </p>
                    </div>

                    <div class="action">
                        ${item.action_type || "ACTION"}
                    </div>

                </div>
            `).join("")}

        </div>
    `;

    container.appendChild(dashboard);
}


document.addEventListener(
    "DOMContentLoaded",
    loadRecoveryAnalysis
);
