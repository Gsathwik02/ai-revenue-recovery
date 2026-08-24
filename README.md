# AI Revenue Recovery Agent 🚀

An AI-powered payment recovery dashboard that analyzes overdue transactions, identifies recovery priority, evaluates risk, and recommends the best recovery action.

## 🎯 What This Project Does

The system analyzes payment transactions and provides:

- Recovery Score
- Recovery Probability
- Priority Level
- Risk Level
- AI Recommendation
- AI Explanation
- AI Decision
- Recommended Action
- Personalized Recovery Message

The goal is to help businesses identify important overdue payments and focus recovery efforts on the right customers.

## 🧠 How It Works

Transaction Data
↓
Backend API
↓
Recovery Analysis
↓
Priority & Risk Classification
↓
AI Recovery Decision
↓
Recommended Action
↓
Personalized Recovery Message
↓
Dashboard

## ✨ Features

### Dashboard
- Total Transactions
- High Priority Transactions
- Medium Priority Transactions
- Low Priority Transactions
- Total Outstanding Amount
- High Priority Amount
- Potential Recovery

### Recovery Analysis
- Customer search
- Transaction search
- Priority filtering
- Recovery score
- Recovery probability
- Risk level
- AI recommendation
- AI explanation
- AI decision
- Recommended action

### AI Recovery Action Center

🚨 Critical Accounts  
Identifies high-priority accounts requiring immediate attention.

💳 Payment Retry  
Identifies medium-priority accounts suitable for payment retry assistance.

📩 Automated Recovery  
Identifies low-risk accounts suitable for automated reminders.

### Recovery Messages

The system generates personalized payment recovery messages for customers.

Users can view and copy the generated message directly from the dashboard.

## ⚙️ Priority Logic

### HIGH

A transaction is classified as HIGH when:

- Backend priority is HIGH, or
- Payment is overdue by 18 or more days.

### MEDIUM

A transaction is classified as MEDIUM when:

- Backend priority is MEDIUM, or
- Payment is overdue by 10 or more days, or
- Recovery score is 5 or higher.

### LOW

Transactions that do not meet the HIGH or MEDIUM conditions are classified as LOW.

## 🔌 API Endpoints

### Recovery Analysis

```text
GET /recovery-analysis