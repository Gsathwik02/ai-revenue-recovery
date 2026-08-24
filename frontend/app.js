const API_URL =
    "https://ai-revenue-recovery-backend.onrender.com";

let recoveryData = [];
let filteredData = [];

// ============================================================
// LOAD RECOVERY DATA
// ============================================================

async function loadRecoveryAnalysis() {

    const tableBody =
        document.getElementById("recoveryTableBody");

    try {

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="loading-cell">
                        Loading AI recovery analysis...
                    </td>
                </tr>
            `;
        }

        const response =
            await fetch(`${API_URL}/recovery-analysis`);

        if (!response.ok) {
            throw new Error("Recovery API request failed");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid recovery data");
        }

        recoveryData = data;
        filteredData = [...data];

        updateDashboard();
        displayTransactions(filteredData);
        displayInsights();
        displayRecommendations();

        console.log(
            "Recovery analysis loaded:",
            recoveryData
        );

    } catch (error) {

        console.error(
            "Recovery Analysis Error:",
            error
        );

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="loading-cell">
                        ⚠️ Unable to load recovery analysis.
                    </td>
                </tr>
            `;
        }
    }
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

    const total = recoveryData.length;

    const totalAmount =
        recoveryData.reduce(
            (sum, item) =>
                sum + Number(item.amount || 0),
            0
        );

    // IMPORTANT:
    // Keep backend risk values exactly:
    // HIGH / MODERATE / LOW

    const high =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "HIGH"
        ).length;

    const moderate =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "MODERATE"
        ).length;

    const low =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "LOW"
        ).length;


    setText(
        "totalAmount",
        `₹${totalAmount.toLocaleString("en-IN")}`
    );

    setText(
        "totalTransactions",
        total
    );

    setText(
        "highRisk",
        high
    );

    setText(
        "moderateRisk",
        moderate
    );

    setText(
        "lowRisk",
        low
    );

    setText(
        "accountsAnalyzed",
        `${total} accounts analyzed`
    );


    const highPercentage =
        total > 0
            ? (high / total) * 100
            : 0;

    const moderatePercentage =
        total > 0
            ? (moderate / total) * 100
            : 0;

    const lowPercentage =
        total > 0
            ? (low / total) * 100
            : 0;


    setBar(
        "highRiskBar",
        highPercentage
    );

    setBar(
        "moderateRiskBar",
        moderatePercentage
    );

    setBar(
        "lowRiskBar",
        lowPercentage
    );


    setText(
        "highRiskBarValue",
        high
    );

    setText(
        "moderateRiskBarValue",
        moderate
    );

    setText(
        "lowRiskBarValue",
        low
    );
}


// ============================================================
// DISPLAY TRANSACTIONS
// ============================================================

function displayTransactions(data) {

    const tableBody =
        document.getElementById(
            "recoveryTableBody"
        );

    if (!tableBody) {
        return;
    }


    if (!data.length) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="loading-cell"
                >
                    No matching transactions found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        data.map(item => {

            const risk =
                String(
                    item.risk_level || "LOW"
                ).toUpperCase();


            const priority =
                getPriority(item);


            const customerId =
                encodeURIComponent(
                    item.customer_id || ""
                );


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                item.transaction_id || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            item.customer_id || "-"
                        )}
                    </td>

                    <td>
                        ₹${Number(
                            item.amount || 0
                        ).toLocaleString("en-IN")}
                    </td>

                    <td>
                        ${item.days_overdue ?? 0} days
                    </td>

                    <td>
                        <span
                            class="risk ${risk.toLowerCase()}"
                        >
                            ${risk}
                        </span>
                    </td>

                    <td>
                        ${item.recovery_score ?? "-"}
                    </td>

                    <td>
                        <span class="priority">
                            ${priority}
                        </span>
                    </td>

                    <td>
                        ${escapeHtml(
                            item.recommended_action ||
                            "Review account"
                        )}
                    </td>

                    <td>
                        <button
                            class="insight-btn"
                            onclick="viewInsights('${customerId}')"
                        >
                            View Insights
                        </button>
                    </td>

                </tr>
            `;

        }).join("");
}


// ============================================================
// PRIORITY
// ============================================================

function getPriority(item) {

    const risk =
        String(
            item.risk_level || ""
        ).toUpperCase();


    if (risk === "HIGH") {
        return "URGENT";
    }


    if (risk === "MODERATE") {
        return "RETRY";
    }


    return "REMINDER";
}


// ============================================================
// FILTERS
// ============================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const riskFilter =
        document.getElementById(
            "riskFilter"
        );

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const risk =
        riskFilter
            ? riskFilter.value
            : "ALL";


    const priority =
        priorityFilter
            ? priorityFilter.value
            : "ALL";


    filteredData =
        recoveryData.filter(item => {

            const customer =
                String(
                    item.customer_id || ""
                ).toLowerCase();


            const transaction =
                String(
                    item.transaction_id || ""
                ).toLowerCase();


            const itemRisk =
                String(
                    item.risk_level || ""
                ).toUpperCase();


            const itemPriority =
                getPriority(item);


            const matchesSearch =
                !search ||
                customer.includes(search) ||
                transaction.includes(search);


            const matchesRisk =
                risk === "ALL" ||
                itemRisk === risk;


            const matchesPriority =
                priority === "ALL" ||
                itemPriority === priority;


            return (
                matchesSearch &&
                matchesRisk &&
                matchesPriority
            );

        });


    displayTransactions(
        filteredData
    );
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const riskFilter =
        document.getElementById(
            "riskFilter"
        );

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    if (searchInput) {
        searchInput.value = "";
    }

    if (riskFilter) {
        riskFilter.value = "ALL";
    }

    if (priorityFilter) {
        priorityFilter.value = "ALL";
    }


    filteredData =
        [...recoveryData];


    displayTransactions(
        filteredData
    );
}


// ============================================================
// AI INSIGHTS
// ============================================================

function displayInsights() {

    const container =
        document.getElementById(
            "insightsContent"
        );

    if (!container) {
        return;
    }

    if (!recoveryData.length) {
        return;
    }


    const high =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "HIGH"
        ).length;


    const moderate =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "MODERATE"
        ).length;


    const low =
        recoveryData.filter(
            item =>
                String(item.risk_level || "")
                    .toUpperCase() === "LOW"
        ).length;


    const totalAmount =
        recoveryData.reduce(
            (sum, item) =>
                sum + Number(item.amount || 0),
            0
        );


    container.innerHTML = `

        <div class="insight-row">

            <span class="insight-number">
                01
            </span>

            <div>
                <strong>
                    ${high} high-risk account(s)
                </strong>

                <p>
                    These accounts require immediate
                    recovery attention.
                </p>
            </div>

        </div>


        <div class="insight-row">

            <span class="insight-number">
                02
            </span>

            <div>
                <strong>
                    ${moderate} moderate-risk account(s)
                </strong>

                <p>
                    Payment retry and personalized
                    follow-up are recommended.
                </p>
            </div>

        </div>


        <div class="insight-row">

            <span class="insight-number">
                03
            </span>

            <div>
                <strong>
                    ${low} low-risk account(s)
                </strong>

                <p>
                    These accounts are suitable
                    for automated reminders.
                </p>
            </div>

        </div>


        <div class="insight-row">

            <span class="insight-number">
                04
            </span>

            <div>
                <strong>
                    ₹${totalAmount.toLocaleString("en-IN")}
                    outstanding
                </strong>

                <p>
                    Total pending payment amount
                    identified by the recovery engine.
                </p>
            </div>

        </div>

    `;
}


// ============================================================
// AI RECOMMENDATIONS
// ============================================================

function displayRecommendations() {

    const container =
        document.getElementById(
            "recommendationsGrid"
        );

    if (!container) {
        return;
    }

    if (!recoveryData.length) {
        return;
    }


    const recommendations =
        recoveryData.slice(0, 6);


    container.innerHTML =
        recommendations
            .map(item => {

                const customer =
                    item.customer_id ||
                    "Customer";


                const recommendation =
                    item.ai_recommendation ||
                    item.recommended_action ||
                    "Review customer account";


                const action =
                    item.action_type ||
                    getPriority(item);


                return `

                    <div class="recommendation-card">

                        <strong>
                            ${escapeHtml(
                                customer
                            )}
                        </strong>

                        <p>
                            ${escapeHtml(
                                recommendation
                            )}
                        </p>

                        <div class="action">
                            ${escapeHtml(
                                action
                            )}
                        </div>

                    </div>

                `;

            })
            .join("");
}


// ============================================================
// VIEW INSIGHTS
// ============================================================

function viewInsights(customerId) {

    const decodedId =
        decodeURIComponent(
            customerId
        );


    const customer =
        recoveryData.find(
            item =>
                String(
                    item.customer_id
                ) ===
                String(decodedId)
        );


    if (!customer) {
        return;
    }


    const modal =
        document.getElementById(
            "insightModal"
        );


    const customerElement =
        document.getElementById(
            "modalCustomer"
        );


    const insightElement =
        document.getElementById(
            "modalInsight"
        );


    if (!modal) {
        return;
    }


    if (customerElement) {

        customerElement.textContent =
            customer.customer_id ||
            decodedId;
    }


    if (insightElement) {

        const risk =
            String(
                customer.risk_level ||
                "LOW"
            ).toUpperCase();


        let riskClass = "low";


        if (risk === "HIGH") {
            riskClass = "high";
        }

        else if (
            risk === "MODERATE"
        ) {
            riskClass = "moderate";
        }


        const score =
            customer.recovery_score ??
            "-";


        const amount =
            Number(
                customer.amount || 0
            ).toLocaleString(
                "en-IN"
            );


        const overdue =
            customer.days_overdue ??
            0;


        const recommendation =
            customer.ai_recommendation ||
            "Review account";


        const decision =
            customer.ai_decision ||
            "No AI decision available.";


        const action =
            customer.recommended_action ||
            "Follow up";


        const message =
            customer.recovery_message ||
            "No recovery message available.";


        insightElement.innerHTML = `

            <div class="modal-summary">

                <div class="modal-stat">

                    <span>
                        Recovery Score
                    </span>

                    <strong>
                        ${score}
                    </strong>

                </div>


                <div class="modal-stat">

                    <span>
                        Risk Level
                    </span>

                    <strong
                        class="modal-risk ${riskClass}"
                    >
                        ${risk}
                    </strong>

                </div>


                <div class="modal-stat">

                    <span>
                        Amount
                    </span>

                    <strong>
                        ₹${amount}
                    </strong>

                </div>


                <div class="modal-stat">

                    <span>
                        Days Overdue
                    </span>

                    <strong>
                        ${overdue}
                    </strong>

                </div>

            </div>


            <div class="modal-section">

                <span class="modal-label">
                    AI RECOMMENDATION
                </span>

                <p>
                    ${escapeHtml(
                        recommendation
                    )}
                </p>

            </div>


            <div class="modal-section">

                <span class="modal-label">
                    AI DECISION
                </span>

                <p>
                    ${escapeHtml(
                        decision
                    )}
                </p>

            </div>


            <div class="modal-section">

                <span class="modal-label">
                    RECOMMENDED ACTION
                </span>

                <p class="modal-action">
                    ${escapeHtml(
                        action
                    )}
                </p>

            </div>


            <div class="modal-section recovery-message">

                <span class="modal-label">
                    RECOVERY MESSAGE
                </span>

                <p>
                    ${escapeHtml(
                        message
                    )}
                </p>

            </div>

        `;
    }


    modal.classList.add("active");
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeInsights() {

    const modal =
        document.getElementById(
            "insightModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );
    }
}


// ============================================================
// HELPER - TEXT
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }
}


// ============================================================
// HELPER - BAR
// ============================================================

function setBar(id, percentage) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.width =
            `${percentage}%`;
    }
}


// ============================================================
// HELPER - ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRecoveryAnalysis();


        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const riskFilter =
            document.getElementById(
                "riskFilter"
            );


        const priorityFilter =
            document.getElementById(
                "priorityFilter"
            );


        const clearButton =
            document.getElementById(
                "clearFilters"
            );


        const closeButton =
            document.getElementById(
                "closeModal"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyFilters
            );
        }


        if (riskFilter) {

            riskFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        if (priorityFilter) {

            priorityFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearFilters
            );
        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeInsights
            );
        }


        const modal =
            document.getElementById(
                "insightModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeInsights();
                    }

                }
            );
        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeInsights();
                }

            }
        );

    }
);
