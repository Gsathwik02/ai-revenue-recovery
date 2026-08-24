const API_URL = "http://127.0.0.1:8000";

let recoveryData = [];


// ============================================================
// LOAD RECOVERY ANALYSIS
// ============================================================

async function loadRecoveryAnalysis() {

    try {

        const response = await fetch(
            `${API_URL}/recovery-analysis`
        );

        if (!response.ok) {
            throw new Error("Failed to load recovery analysis");
        }

        const data = await response.json();

        recoveryData = data;

        // Generate frontend AI analysis
        addAIInsights();

        updateDashboard();

        displayTransactions(recoveryData);

        displayTopCustomers();

        displayAIRecommendations();

    } catch (error) {

        console.error("Recovery Analysis Error:", error);

        const table =
            document.getElementById("transactionTable");

        if (table) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="14"
                        style="text-align:center; padding:30px;"
                    >
                        Unable to load recovery data.
                        Please make sure the backend is running.
                    </td>
                </tr>
            `;
        }
    }
}


// ============================================================
// AI DECISION ENGINE
// ============================================================

function addAIInsights() {

    recoveryData = recoveryData.map(item => {

        const amount =
            Number(item.amount) || 0;

        const overdueDays =
            Number(item.days_overdue) || 0;

        const recoveryScore =
            Number(item.recovery_score) || 0;

        const segment =
            String(
                item.customer_segment || ""
            ).toLowerCase();


        // Keep original backend priority
        const backendPriority =
            String(
                item.priority || ""
            ).toUpperCase();


        let riskLevel = "";
        let aiRecommendation = "";
        let aiExplanation = "";
        let aiDecision = "";
        let recommendedAction = "";


        // ====================================================
        // RECOVERY PROBABILITY
        // Backend score is 0-10
        // Convert to percentage
        // ====================================================

        let recoveryProbability;

        if (recoveryScore <= 10) {

            recoveryProbability =
                recoveryScore * 10;

        } else {

            recoveryProbability =
                recoveryScore;
        }


        // ====================================================
        // CRITICAL RISK
        //
        // CRITICAL when:
        // 1. Backend already says HIGH
        // OR
        // 2. Payment is overdue 18+ days
        //
        // This prevents normal MEDIUM transactions
        // from appearing as CRITICAL just because
        // their recovery score is high.
        // ====================================================

        if (
            backendPriority === "HIGH" ||
            overdueDays >= 18
        ) {

            riskLevel = "CRITICAL";


            if (
                amount >= 50000 &&
                overdueDays >= 18
            ) {

                aiRecommendation =
                    "High-value overdue account requires immediate intervention";

                aiExplanation =
                    "The account has a high outstanding amount and has remained overdue for a long period.";

                aiDecision =
                    "Escalate to priority recovery team and offer assisted payment plan";

                recommendedAction =
                    "Priority team contact";

            }

            else if (overdueDays >= 18) {

                aiRecommendation =
                    "Account requires immediate recovery intervention";

                aiExplanation =
                    "The payment has remained overdue for a significant period and requires direct customer engagement.";

                aiDecision =
                    "Contact customer immediately and offer assisted recovery";

                recommendedAction =
                    "Immediate customer contact";

            }

            else {

                aiRecommendation =
                    "High-priority account requires immediate intervention";

                aiExplanation =
                    "The account has been identified as high priority and requires immediate recovery attention.";

                aiDecision =
                    "Contact customer immediately with personalized payment assistance";

                recommendedAction =
                    "Personalized recovery call";
            }
        }


        // ====================================================
        // MODERATE RISK
        //
        // MEDIUM backend priority
        // OR 10+ days overdue
        // OR recovery score >= 5
        // ====================================================

        else if (
            backendPriority === "MEDIUM" ||
            overdueDays >= 10 ||
            recoveryScore >= 5
        ) {

            riskLevel = "MODERATE";


            if (
                segment.includes("premium") ||
                segment.includes("high")
            ) {

                aiRecommendation =
                    "Valuable customer requires personalized follow-up";

                aiExplanation =
                    "The customer segment suggests that personalized communication may improve recovery.";

                aiDecision =
                    "Send personalized reminder with payment retry and priority support";

                recommendedAction =
                    "Priority payment reminder";
            }


            else if (overdueDays >= 10) {

                aiRecommendation =
                    "Payment is significantly overdue";

                aiExplanation =
                    "The payment has remained overdue long enough to require an urgent follow-up.";

                aiDecision =
                    "Send urgent payment reminder with retry option";

                recommendedAction =
                    "Urgent payment reminder";
            }


            else if (recoveryScore >= 5) {

                aiRecommendation =
                    "Customer has moderate recovery potential";

                aiExplanation =
                    "The recovery score indicates a reasonable chance of successful payment.";

                aiDecision =
                    "Send personalized payment reminder and monitor response";

                recommendedAction =
                    "Personalized reminder";
            }


            else {

                aiRecommendation =
                    "Follow-up required before account escalation";

                aiExplanation =
                    "The account requires additional payment follow-up before stronger recovery action.";

                aiDecision =
                    "Send payment reminder and provide retry option";

                recommendedAction =
                    "Payment reminder";
            }
        }


        // ====================================================
        // LOW RISK
        // ====================================================

        else {

            riskLevel = "LOW";


            if (overdueDays <= 7) {

                aiRecommendation =
                    "Payment is only recently overdue";

                aiExplanation =
                    "The account is only slightly overdue and can remain within the normal payment window.";

                aiDecision =
                    "Send gentle payment reminder and allow normal payment window";

                recommendedAction =
                    "Gentle reminder";

            }

            else {

                aiRecommendation =
                    "Low-risk account suitable for automated recovery";

                aiExplanation =
                    "The account has relatively low recovery risk and can be handled automatically.";

                aiDecision =
                    "Send automated reminder and monitor payment status";

                recommendedAction =
                    "Automated reminder";
            }
        }


        // ====================================================
        // IMPORTANT FIX
        //
        // Make PRIORITY match RISK LEVEL.
        //
        // CRITICAL  = HIGH
        // MODERATE  = MEDIUM
        // LOW       = LOW
        // ====================================================

        let calculatedPriority = "LOW";

        if (riskLevel === "CRITICAL") {

            calculatedPriority = "HIGH";

        }
        else if (riskLevel === "MODERATE") {

            calculatedPriority = "MEDIUM";
        }


        // ====================================================
        // ACTION TYPE
        // ====================================================

        let actionType = "REMINDER";

        if (riskLevel === "CRITICAL") {

            actionType = "CONTACT";

        }
        else if (riskLevel === "MODERATE") {

            actionType = "RETRY";
        }


        // ====================================================
        // RETURN UPDATED TRANSACTION
        // ====================================================

        return {

            ...item,

            // IMPORTANT:
            // Override backend priority with calculated priority
            priority:
                calculatedPriority,

            risk_level:
                riskLevel,

            recovery_probability:
                recoveryProbability,

            ai_recommendation:
                aiRecommendation,

            ai_explanation:
                aiExplanation,

            ai_decision:
                aiDecision,

            recommended_action:
                recommendedAction,

            action_type:
                actionType
        };

    });
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

    const total =
        recoveryData.length;


    // ========================================================
    // COUNTS
    // ========================================================

    const high =
        recoveryData.filter(
            item =>
                item.priority === "HIGH"
        ).length;


    const medium =
        recoveryData.filter(
            item =>
                item.priority === "MEDIUM"
        ).length;


    const low =
        recoveryData.filter(
            item =>
                item.priority === "LOW"
        ).length;


    // ========================================================
    // BASIC STATS
    // ========================================================

    const totalTransactions =
        document.getElementById(
            "totalTransactions"
        );

    if (totalTransactions) {

        totalTransactions.textContent =
            total;
    }


    const highPriority =
        document.getElementById(
            "highPriority"
        );

    if (highPriority) {

        highPriority.textContent =
            high;
    }


    const mediumPriority =
        document.getElementById(
            "mediumPriority"
        );

    if (mediumPriority) {

        mediumPriority.textContent =
            medium;
    }


    const lowPriority =
        document.getElementById(
            "lowPriority"
        );

    if (lowPriority) {

        lowPriority.textContent =
            low;
    }


    // ========================================================
    // FINANCIAL DATA
    // ========================================================

    const totalOutstanding =
        recoveryData.reduce(
            (sum, item) =>
                sum +
                Number(item.amount || 0),
            0
        );


    const highPriorityAmount =
        recoveryData
            .filter(
                item =>
                    item.priority === "HIGH"
            )
            .reduce(
                (sum, item) =>
                    sum +
                    Number(item.amount || 0),
                0
            );


    const potentialRecovery =
        recoveryData
            .filter(
                item =>
                    item.priority === "HIGH" ||
                    item.priority === "MEDIUM"
            )
            .reduce(
                (sum, item) =>
                    sum +
                    Number(item.amount || 0),
                0
            );


    const totalOutstandingElement =
        document.getElementById(
            "totalOutstanding"
        );

    if (totalOutstandingElement) {

        totalOutstandingElement.textContent =
            `₹${totalOutstanding.toLocaleString("en-IN")}`;
    }


    const highPriorityAmountElement =
        document.getElementById(
            "highPriorityAmount"
        );

    if (highPriorityAmountElement) {

        highPriorityAmountElement.textContent =
            `₹${highPriorityAmount.toLocaleString("en-IN")}`;
    }


    const potentialRecoveryElement =
        document.getElementById(
            "potentialRecovery"
        );

    if (potentialRecoveryElement) {

        potentialRecoveryElement.textContent =
            `₹${potentialRecovery.toLocaleString("en-IN")}`;
    }


    // ========================================================
    // CHART
    // ========================================================

    const highPercentage =
        total > 0
            ? (high / total) * 100
            : 0;


    const mediumPercentage =
        total > 0
            ? (medium / total) * 100
            : 0;


    const lowPercentage =
        total > 0
            ? (low / total) * 100
            : 0;


    const highBar =
        document.getElementById(
            "highBar"
        );

    const mediumBar =
        document.getElementById(
            "mediumBar"
        );

    const lowBar =
        document.getElementById(
            "lowBar"
        );


    if (highBar) {

        highBar.style.width =
            `${highPercentage}%`;
    }


    if (mediumBar) {

        mediumBar.style.width =
            `${mediumPercentage}%`;
    }


    if (lowBar) {

        lowBar.style.width =
            `${lowPercentage}%`;
    }


    const highChartValue =
        document.getElementById(
            "highChartValue"
        );

    if (highChartValue) {

        highChartValue.textContent =
            high;
    }


    const mediumChartValue =
        document.getElementById(
            "mediumChartValue"
        );

    if (mediumChartValue) {

        mediumChartValue.textContent =
            medium;
    }


    const lowChartValue =
        document.getElementById(
            "lowChartValue"
        );

    if (lowChartValue) {

        lowChartValue.textContent =
            low;
    }


    // ========================================================
    // PERFORMANCE
    // ========================================================

    if (total > 0) {

        const totalScore =
            recoveryData.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.recovery_score || 0
                    ),
                0
            );


        const averageScore =
            totalScore / total;


        const averageScoreElement =
            document.getElementById(
                "averageScore"
            );

        if (averageScoreElement) {

            averageScoreElement.textContent =
                averageScore.toFixed(2);
        }


        const criticalRate =
            (high / total) * 100;


        const highRecoveryRateElement =
            document.getElementById(
                "highRecoveryRate"
            );

        if (highRecoveryRateElement) {

            highRecoveryRateElement.textContent =
                `${criticalRate.toFixed(1)}%`;
        }


        const potentialRate =
            totalOutstanding > 0
                ? (potentialRecovery / totalOutstanding) * 100
                : 0;


        const potentialRecoveryRateElement =
            document.getElementById(
                "potentialRecoveryRate"
            );

        if (potentialRecoveryRateElement) {

            potentialRecoveryRateElement.textContent =
                `${potentialRate.toFixed(1)}%`;
        }
    }
}


// ============================================================
// TOP CUSTOMERS
// ============================================================

function displayTopCustomers() {

    const container =
        document.getElementById(
            "topCustomers"
        );

    if (!container) {
        return;
    }


    const topCustomers =
        [...recoveryData]
            .sort(
                (a, b) =>
                    Number(
                        b.recovery_score || 0
                    ) -
                    Number(
                        a.recovery_score || 0
                    )
            )
            .slice(0, 5);


    container.innerHTML = "";


    topCustomers.forEach(
        (customer, index) => {

            const item =
                document.createElement("div");


            item.className =
                "top-customer";


            item.innerHTML = `
                <div>

                    <strong>
                        #${index + 1}
                        ${customer.customer_id}
                    </strong>

                    <p>
                        ₹${Number(
                            customer.amount || 0
                        ).toLocaleString("en-IN")}

                        •

                        ${customer.days_overdue}
                        days overdue
                    </p>

                </div>

                <span>

                    Score:
                    ${customer.recovery_score}

                </span>
            `;


            container.appendChild(item);
        }
    );
}


// ============================================================
// AI RECOMMENDATIONS
// ============================================================

function displayAIRecommendations() {

    const container =
        document.getElementById(
            "aiRecommendations"
        );

    if (!container) {
        return;
    }


    const criticalCount =
        recoveryData.filter(
            item =>
                item.priority === "HIGH"
        ).length;


    const mediumCount =
        recoveryData.filter(
            item =>
                item.priority === "MEDIUM"
        ).length;


    const lowCount =
        recoveryData.filter(
            item =>
                item.priority === "LOW"
        ).length;


    container.innerHTML = `

        <div class="recommendation">

            <strong>
                🔥 High Priority Focus
            </strong>

            <p>
                ${criticalCount}
                high-priority transaction(s) require
                immediate recovery attention.
            </p>

        </div>


        <div class="recommendation">

            <strong>
                🚨 Critical Risk
            </strong>

            <p>
                ${criticalCount}
                account(s) are currently classified
                as critical risk.
            </p>

        </div>


        <div class="recommendation">

            <strong>
                💳 Payment Retry
            </strong>

            <p>
                ${mediumCount}
                moderate-risk account(s) can be
                targeted with payment retry options.
            </p>

        </div>


        <div class="recommendation">

            <strong>
                📩 Automated Recovery
            </strong>

            <p>
                ${lowCount}
                low-risk account(s) are suitable
                for automated recovery.
            </p>

        </div>

    `;
}


// ============================================================
// RECOVERY ACTION BUTTON
// ============================================================

function getActionButton(txn) {

    const customerId =
        encodeURIComponent(
            txn.customer_id
        );


    if (txn.priority === "HIGH") {

        return `
            <button
                class="message-btn action-contact-btn"
                onclick="generateMessage('${customerId}')"
            >
                🚨 Contact Now
            </button>
        `;
    }


    if (txn.priority === "MEDIUM") {

        return `
            <button
                class="message-btn action-retry-btn"
                onclick="generateMessage('${customerId}')"
            >
                💳 Send Retry
            </button>
        `;
    }


    return `
        <button
            class="message-btn action-reminder-btn"
            onclick="generateMessage('${customerId}')"
        >
            📩 Send Reminder
        </button>
    `;
}


// ============================================================
// DISPLAY TRANSACTIONS
// ============================================================

function displayTransactions(data) {

    const table =
        document.getElementById(
            "transactionTable"
        );

    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="14"
                    style="text-align:center; padding:30px;"
                >
                    No matching transactions found.
                </td>

            </tr>
        `;

        return;
    }


    data.forEach(txn => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${txn.transaction_id || "-"}
            </td>


            <td>
                ${txn.customer_id || "-"}
            </td>


            <td>
                ₹${Number(
                    txn.amount || 0
                ).toLocaleString("en-IN")}
            </td>


            <td>
                ${txn.days_overdue || 0}
                days
            </td>


            <td>
                ${txn.customer_segment || "-"}
            </td>


            <td>
                ${txn.recovery_score ?? 0}
            </td>


            <td>
                ${Number(
                    txn.recovery_probability ?? 0
                ).toFixed(1)}%
            </td>


            <td>

                <span
                    class="priority-${String(
                        txn.priority || ""
                    ).toLowerCase()}"
                >
                    ${txn.priority || "-"}
                </span>

            </td>


            <td>

                <span
                    class="risk-${String(
                        txn.risk_level || ""
                    ).toLowerCase()}"
                >
                    ${txn.risk_level || "-"}
                </span>

            </td>


            <td>

                ${txn.ai_recommendation ||
                "No recommendation"}

            </td>


            <td>

                ${txn.ai_explanation ||
                "No explanation available"}

            </td>


            <td>

                <strong class="ai-decision">

                    ${txn.ai_decision ||
                    "No decision"}

                </strong>

            </td>


            <td>

                <strong>

                    ${txn.recommended_action ||
                    "Automated reminder"}

                </strong>

            </td>


            <td>

                ${getActionButton(txn)}

            </td>

        `;


        table.appendChild(row);

    });
}


// ============================================================
// SEARCH TRANSACTIONS
// ============================================================

function searchTransactions() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchValue =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedPriority =
        priorityFilter
            ? priorityFilter.value.toUpperCase()
            : "ALL";


    const filtered =
        recoveryData.filter(item => {

            const matchesSearch =

                String(
                    item.customer_id
                )
                    .toLowerCase()
                    .includes(searchValue)

                ||

                String(
                    item.transaction_id
                )
                    .toLowerCase()
                    .includes(searchValue);


            const matchesPriority =

                selectedPriority === "ALL"

                ||

                String(
                    item.priority || ""
                ).toUpperCase() ===
                selectedPriority;


            return (
                matchesSearch &&
                matchesPriority
            );

        });


    displayTransactions(filtered);
}


// ============================================================
// PRIORITY FILTER
// ============================================================

function filterPriority() {

    searchTransactions();
}


// ============================================================
// CRITICAL ACCOUNTS
// ============================================================

function filterCriticalAccounts() {

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    // Clear search
    if (searchInput) {

        searchInput.value = "";
    }


    // Set priority filter to HIGH
    if (priorityFilter) {

        priorityFilter.value =
            "HIGH";
    }


    // CRITICAL = HIGH
    const filtered =
        recoveryData.filter(
            item =>
                item.priority === "HIGH"
        );


    displayTransactions(filtered);


    scrollToRecoveryAnalysis();
}


// ============================================================
// PAYMENT RETRY
// ============================================================

function filterRetryAccounts() {

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.value = "";
    }


    if (priorityFilter) {

        priorityFilter.value =
            "MEDIUM";
    }


    // MODERATE = MEDIUM
    const filtered =
        recoveryData.filter(
            item =>
                item.priority === "MEDIUM"
        );


    displayTransactions(filtered);


    scrollToRecoveryAnalysis();
}


// ============================================================
// AUTOMATED RECOVERY
// ============================================================

function filterAutomatedAccounts() {

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.value = "";
    }


    if (priorityFilter) {

        priorityFilter.value =
            "LOW";
    }


    // LOW RISK = LOW
    const filtered =
        recoveryData.filter(
            item =>
                item.priority === "LOW"
        );


    displayTransactions(filtered);


    scrollToRecoveryAnalysis();
}


// ============================================================
// SCROLL TO RECOVERY ANALYSIS
// ============================================================

function scrollToRecoveryAnalysis() {

    const section =
        document.querySelector(
            ".transactions"
        );


    if (section) {

        section.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }
}


// ============================================================
// FILTER BY PRIORITY
// ============================================================

function filterPriorityByAction(priority) {

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.value = "";
    }


    const normalizedPriority =
        String(
            priority || ""
        ).toUpperCase();


    if (priorityFilter) {

        priorityFilter.value =
            normalizedPriority;
    }


    const filtered =
        recoveryData.filter(
            item =>
                String(
                    item.priority || ""
                ).toUpperCase() ===
                normalizedPriority
        );


    displayTransactions(filtered);


    scrollToRecoveryAnalysis();
}


// ============================================================
// GENERATE RECOVERY MESSAGE
// ============================================================

async function generateMessage(customerId) {

    try {

        const decodedCustomerId =
            decodeURIComponent(
                customerId
            );


        const response =
            await fetch(
                `${API_URL}/recovery-message/${decodedCustomerId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to generate message"
            );
        }


        const data =
            await response.json();


        const modalCustomer =
            document.getElementById(
                "modalCustomer"
            );

        if (modalCustomer) {

            modalCustomer.textContent =
                data.customer_id ||
                decodedCustomerId;
        }


        const modalPriority =
            document.getElementById(
                "modalPriority"
            );

        if (modalPriority) {

            modalPriority.textContent =
                data.priority || "-";
        }


        const modalScore =
            document.getElementById(
                "modalScore"
            );

        if (modalScore) {

            modalScore.textContent =
                data.recovery_score ?? "-";
        }


        const modalMessage =
            document.getElementById(
                "modalMessage"
            );

        if (modalMessage) {

            modalMessage.textContent =
                data.message ||
                "No recovery message generated.";
        }


        const messageModal =
            document.getElementById(
                "messageModal"
            );

        if (messageModal) {

            messageModal.style.display =
                "block";
        }


    } catch (error) {

        console.error(
            "Recovery Message Error:",
            error
        );


        alert(
            "Unable to generate recovery message."
        );
    }
}


// ============================================================
// CLOSE MESSAGE MODAL
// ============================================================

function closeMessageModal() {

    const modal =
        document.getElementById(
            "messageModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


// ============================================================
// COPY RECOVERY MESSAGE
// ============================================================

function copyRecoveryMessage() {

    const messageElement =
        document.getElementById(
            "modalMessage"
        );


    if (!messageElement) {
        return;
    }


    const message =
        messageElement.textContent;


    navigator.clipboard.writeText(
        message
    );


    alert(
        "Recovery message copied!"
    );
}


// ============================================================
// CLOSE MODAL OUTSIDE CLICK
// ============================================================

window.onclick = function(event) {

    const modal =
        document.getElementById(
            "messageModal"
        );


    if (
        modal &&
        event.target === modal
    ) {

        modal.style.display =
            "none";
    }
};


// ============================================================
// START APPLICATION
// ============================================================

loadRecoveryAnalysis();