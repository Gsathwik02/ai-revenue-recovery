const API_URL = "https://ai-revenue-recovery-backend.onrender.com";

let recoveryData = [];

async function loadRecoveryAnalysis() {
    try {
        const response = await fetch(`${API_URL}/recovery-analysis`);

        if (!response.ok) {
            throw new Error("Failed to load recovery analysis");
        }

        recoveryData = await response.json();

        console.log("Recovery analysis loaded:", recoveryData);

    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadRecoveryAnalysis();
});
