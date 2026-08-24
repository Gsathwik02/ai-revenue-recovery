const API_URL = "https://ai-revenue-recovery-backend.onrender.com";

let recoveryData = [];

async function loadRecoveryAnalysis() {
    try {
        const response = await fetch(`${API_URL}/recovery-analysis`);

        if (!response.ok) {
            throw new Error("Failed to load recovery analysis");
        }

        recoveryData = await response.json();

        renderDashboard(recoveryData);

    } catch (error) {
        console.error("Error:", error);

        document.querySelector(".container").innerHTML += `
            <div class="error-box">
                Failed to load recovery data.
            </div>
        `;
    }
}

function renderDashboard(data) {

    const container = document.querySelector(".container");

    // Calculate summary
    const totalTransactions = data.length;

    const totalAmount = data.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const highRisk = data.filter(
        item => item.risk_level === "HIGH"
    ).length;

    const mediumRisk = data.filter(
        item => item.risk_level === "MODERATE"
    ).length;

    const lowRisk = data.filter(
        item => item.risk_level === "LOW"
    ).length;

    const dashboard = document.createElement("section");

    dashboard.className = "dashboard";

    dashboard.innerHTML = `
        <div class="summary-grid">

            <div class="summary-card">
                <h3>Total Transactions</h3>
                <p>${totalTransactions}</p>
            </div>

            <div class="summary-card">
                <h3>Total Outstanding</h3>
                <p>₹${totalAmount.toLocaleString("en-IN")}</p>
            </div>

            <div class="summary-card">
                <h3>High Risk</h3>
                <p>${highRisk}</p>
            </div>

            <div class="summary-card">
                <h3>Medium Risk</h3>
                <p>${mediumRisk}</p>
            </div>

            <div class="summary-card">
                <h3>Low Risk</h3>
                <p>${lowRisk}</p>
            </div>

        </div>

        <div class="transactions-section">

            <h2>AI Recovery Analysis</h2>

            <div class="table-wrapper">

                <table>

                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Days Overdue</th>
                            <th>Risk</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(item => `
                            <tr>

                                <td>${item.transaction_id}</td>

                                <td>${item.customer_id}</td>

                                <td>
                                    ₹${item.amount.toLocaleString("en-IN")}
                                </td>

                                <td>
                                    ${item.days_overdue}
                                </td>

                                <td>
                                    <span class="risk ${item.risk_level.toLowerCase()}">
                                        ${item.risk_level}
                                    </span>
                                </td>

                                <td>
                                    ${item.recommended_action}
                                </td>

                            </tr>
                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;

    container.appendChild(dashboard);
}


document.addEventListener("DOMContentLoaded", () => {
    loadRecoveryAnalysis();
});
