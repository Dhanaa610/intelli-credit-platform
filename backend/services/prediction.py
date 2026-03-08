from typing import Any

def evaluate_credit_risk(ratios: dict, research: dict, fraud_signals: list, company_info: dict) -> tuple:
    """
    Module 6 & 7: Machine Learning Credit Risk Model & Decision Engine
    Calculates probability of default and strict lending limits.
    """
    
    # Base score out of 100
    score = 50.0 
    
    # Financial Factors (+/-)
    if ratios["profit_margin"] > 10:
        score += 15
    elif ratios["profit_margin"] < 0:
        score -= 20
        
    if ratios["current_ratio"] > 1.5:
        score += 10
    elif ratios["current_ratio"] < 1.0:
        score -= 15
        
    if ratios["debt_to_equity"] < 1.5:
        score += 10
    elif ratios["debt_to_equity"] > 3.0:
        score -= 15
        
    # Research & Sentiment Factors (+/-)
    if research["web_sentiment"] > 75:
        score += 5
    elif research["web_sentiment"] < 40:
        score -= 10
        
    if research["legal_disputes"] > 0:
        score -= (research["legal_disputes"] * 10)
        
    # Fraud Risk Multiplier
    has_critical_fraud = any(f["type"] == "High Risk" for f in fraud_signals)
    if has_critical_fraud:
        score = score * 0.5 # slash score in half
        
    # Cap score
    final_score = max(5.0, min(95.0, score))
    raw_pd = float(100.0 - float(final_score))
    prob_default = round(raw_pd, 2)  # type: ignore
    
    # Recommendation Logic (Module 7)
    decision: dict[str, Any] = {}
    base_interest = 8.5 # standard market rate
    revenue = company_info["revenue"]
    requested = company_info["requested"]
    
    if final_score >= 75:
        decision["status"] = "Approved"
        decision["category"] = "Low Risk"
        decision["interest_rate"] = f"{base_interest + 1.0}%"
        max_limit = revenue * 0.30  # 30% of revenue
    elif 50 <= final_score < 75:
        decision["status"] = "Conditional Approval"
        decision["category"] = "Medium Risk"
        decision["interest_rate"] = f"{base_interest + 3.0}%"
        max_limit = revenue * 0.20  # 20% of revenue
    else:
        decision["status"] = "Rejected"
        decision["category"] = "High Risk"
        decision["interest_rate"] = "N/A"
        max_limit = 0.0
        
    # Cap the recommended amount at the requested amount, unless they asked for more than max limit
    recommended_amount = float(min(requested, max_limit))
    decision["recommended_limit"] = recommended_amount
    
    # Explainable AI Text
    reasons: list[str] = [
        f"Model analyzed a probability of default of {prob_default}%.",
        f"Profit margin is {'strong' if ratios['profit_margin'] > 10 else 'weak'} at {ratios['profit_margin']}%."
    ]
    if research["legal_disputes"] > 0:
        reasons.append(f"High risk flagged due to {research['legal_disputes']} active legal dispute(s).")
    if has_critical_fraud:
        reasons.append("Application triggered critical financial anomaly/fraud alerts.")
    elif decision["status"] == "Approved":
        reasons.append("No major legal or fraud risks detected. Repayment capacity is healthy.")
        
    decision["explanation"] = reasons
    
    risk_profile = {
        "score": round(float(final_score), 1),  # type: ignore
        "pd_percentage": prob_default,
        "features_used": ["profit_margin", "debt_to_equity", "current_ratio", "web_sentiment", "legal_disputes", "fraud_flags"]
    }

    return risk_profile, decision
