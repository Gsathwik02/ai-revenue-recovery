from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path

app = FastAPI(
    title="AI Revenue Recovery Agent",
    description="AI-powered revenue recovery system",
    version="3.0.1"
)

# ========================================
# CORS
# ========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# LOAD DATA
# ========================================

DATA_PATH = Path(__file__).parent.parent / "data" / "transactions.csv"

df = pd.read_csv(DATA_PATH)


# ========================================
# HOME
# ========================================

@app.get("/")
def home():
    return {
        "message": "AI Revenue Recovery Agent is running!",
        "version": "3.0.1"
    }


# ========================================
# HEALTH
# ========================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "transactions_loaded": len(df)
    }


# ========================================
# TRANSACTIONS
# ========================================

@app.get("/transactions")
def get_transactions():
    return df.to_dict(orient="records")


# ========================================
# RECOVERY ANALYSIS
# ========================================

@app.get("/recovery-analysis")
def recovery_analysis():

    results = []

    for _, row in df.iterrows():

        amount = float(row["amount"])
        overdue_days = int(row["days_overdue"])

        segment = str(
            row["customer_segment"]
        ).lower().strip()

        # ========================================
        # RECOVERY SCORE
        # ========================================

        score = 0

        # Amount score
        if amount >= 50000:
            score += 5
        elif amount >= 20000:
            score += 4
        elif amount >= 5000:
            score += 3
        elif amount >= 2000:
            score += 2
        else:
            score += 1

        # Overdue score
        if overdue_days >= 60:
            score += 5
        elif overdue_days >= 30:
            score += 4
        elif overdue_days >= 15:
            score += 3
        elif overdue_days >= 7:
            score += 2
        elif overdue_days > 0:
            score += 1

        # Customer segment score
        if segment in ["premium", "high", "vip"]:
            score += 2

        # ========================================
        # PRIORITY
        # ========================================

        if score >= 9:
            priority = "HIGH"

        elif score >= 6:
            priority = "MEDIUM"

        else:
            priority = "LOW"

        # ========================================
        # RISK LEVEL
        # IMPORTANT:
        # Frontend expects HIGH / MODERATE / LOW
        # NOT CRITICAL
        # ========================================

        if (
            priority == "HIGH"
            or overdue_days >= 30
            or score >= 10
        ):
            risk_level = "HIGH"

        elif (
            priority == "MEDIUM"
            or overdue_days >= 15
            or score >= 6
        ):
            risk_level = "MODERATE"

        else:
            risk_level = "LOW"

        # ========================================
        # AI RECOMMENDATION + ACTION
        # ========================================

        if risk_level == "HIGH":

            if amount >= 50000 and overdue_days >= 30:

                ai_recommendation = (
                    "High-value overdue account requires "
                    "immediate intervention"
                )

                ai_decision = (
                    "Escalate to priority recovery team "
                    "and offer assisted payment plan"
                )

                recommended_action = (
                    "Priority team contact"
                )

                action_type = "CONTACT"

            elif score >= 10:

                ai_recommendation = (
                    "Customer shows strong recovery potential"
                )

                ai_decision = (
                    "Contact customer immediately with "
                    "personalized payment assistance"
                )

                recommended_action = (
                    "Personalized recovery call"
                )

                action_type = "CONTACT"

            else:

                ai_recommendation = (
                    "Immediate personalized recovery required"
                )

                ai_decision = (
                    "Contact customer immediately and "
                    "offer assisted recovery"
                )

                recommended_action = (
                    "Immediate customer contact"
                )

                action_type = "CONTACT"

        elif risk_level == "MODERATE":

            if segment in ["premium", "high", "vip"]:

                ai_recommendation = (
                    "Valuable customer requires "
                    "personalized follow-up"
                )

                ai_decision = (
                    "Send personalized reminder with "
                    "payment retry and priority support"
                )

                recommended_action = (
                    "Priority payment reminder"
                )

                action_type = "RETRY"

            elif overdue_days >= 15:

                ai_recommendation = (
                    "Payment is significantly overdue"
                )

                ai_decision = (
                    "Send urgent payment reminder "
                    "with retry option"
                )

                recommended_action = (
                    "Urgent payment reminder"
                )

                action_type = "RETRY"

            else:

                ai_recommendation = (
                    "Customer has moderate recovery potential"
                )

                ai_decision = (
                    "Send personalized payment reminder "
                    "and monitor response"
                )

                recommended_action = (
                    "Personalized payment reminder"
                )

                action_type = "RETRY"

        else:

            ai_recommendation = (
                "Low-risk account suitable for "
                "automated recovery"
            )

            ai_decision = (
                "Send automated reminder and "
                "monitor payment status"
            )

            recommended_action = (
                "Automated payment reminder"
            )

            action_type = "REMINDER"

        # ========================================
        # RECOVERY MESSAGE
        # ========================================

        customer_id = str(row["customer_id"])

        if risk_level == "HIGH":

            recovery_message = (
                f"Hi {customer_id}, your payment of "
                f"₹{amount:,.0f} has been overdue for "
                f"{overdue_days} days. Our recovery team "
                f"is available to assist you with completing "
                f"the payment or arranging a suitable payment "
                f"option. Please contact us at your earliest "
                f"convenience."
            )

        elif risk_level == "MODERATE":

            recovery_message = (
                f"Hi {customer_id}, this is a friendly "
                f"reminder that your payment of "
                f"₹{amount:,.0f} is overdue by "
                f"{overdue_days} days. Please retry the "
                f"payment at your earliest convenience."
            )

        else:

            recovery_message = (
                f"Hi {customer_id}, this is a gentle "
                f"reminder regarding your pending payment "
                f"of ₹{amount:,.0f}. Please complete the "
                f"payment when convenient."
            )

        # ========================================
        # FINAL RESULT
        # ========================================

        results.append({
            "transaction_id": str(row["transaction_id"]),
            "customer_id": customer_id,
            "amount": amount,
            "days_overdue": overdue_days,
            "customer_segment": str(row["customer_segment"]),

            "recovery_score": score,
            "priority": priority,
            "risk_level": risk_level,

            "ai_recommendation": ai_recommendation,
            "ai_decision": ai_decision,

            "recommended_action": recommended_action,
            "action_type": action_type,

            "recovery_message": recovery_message
        })

    return results


# ========================================
# CUSTOMER RECOVERY
# ========================================

@app.get("/customer/{customer_id}")
def customer_recovery(customer_id: str):

    results = recovery_analysis()

    for result in results:

        if str(result["customer_id"]) == str(customer_id):
            return result

    return {
        "error": "Customer not found"
    }


# ========================================
# AI RECOVERY MESSAGE
# ========================================

@app.get("/recovery-message/{customer_id}")
def recovery_message(customer_id: str):

    results = recovery_analysis()

    for result in results:

        if str(result["customer_id"]) == str(customer_id):

            return {
                "customer_id": result["customer_id"],
                "priority": result["priority"],
                "risk_level": result["risk_level"],
                "recovery_score": result["recovery_score"],
                "recommended_action": result["recommended_action"],
                "message": result["recovery_message"]
            }

    return {
        "error": "Customer not found"
    }


# ========================================
# DASHBOARD STATISTICS
# ========================================

@app.get("/dashboard-stats")
def dashboard_stats():

    results = recovery_analysis()

    total_transactions = len(results)

    high_priority = sum(
        1 for item in results
        if item["priority"] == "HIGH"
    )

    medium_priority = sum(
        1 for item in results
        if item["priority"] == "MEDIUM"
    )

    low_priority = sum(
        1 for item in results
        if item["priority"] == "LOW"
    )

    high_risk = sum(
        1 for item in results
        if item["risk_level"] == "HIGH"
    )

    moderate_risk = sum(
        1 for item in results
        if item["risk_level"] == "MODERATE"
    )

    low_risk = sum(
        1 for item in results
        if item["risk_level"] == "LOW"
    )

    total_outstanding = sum(
        item["amount"]
        for item in results
    )

    high_priority_amount = sum(
        item["amount"]
        for item in results
        if item["priority"] == "HIGH"
    )

    potential_recovery = sum(
        item["amount"]
        for item in results
        if item["priority"] in ["HIGH", "MEDIUM"]
    )

    average_score = (
        sum(
            item["recovery_score"]
            for item in results
        ) / total_transactions
        if total_transactions > 0
        else 0
    )

    return {
        "total_transactions": total_transactions,

        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,

        "high_risk": high_risk,
        "moderate_risk": moderate_risk,
        "low_risk": low_risk,

        "total_outstanding": total_outstanding,
        "high_priority_amount": high_priority_amount,
        "potential_recovery": potential_recovery,

        "average_recovery_score": round(
            average_score,
            2
        )
    }
