from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.services.gemini_service import gemini_service

router = APIRouter()

class RetirementAccount(BaseModel):
    type: str
    balance: float
    monthly: float
    employer_match: float

class RetirementPlanningRequest(BaseModel):
    current_age: int
    retirement_age: int
    current_savings: float
    monthly_contribution: float
    current_income: float
    desired_income: float
    accounts: List[RetirementAccount]
    user_context: Dict[str, Any]

@router.post("/retirement-planning")
async def calculate_retirement_projections(request: RetirementPlanningRequest):
    """Calculate retirement projections and provide AI-powered recommendations"""
    try:
        # Use Gemini service for retirement calculations
        projection = await gemini_service.calculate_retirement_plan(
            current_age=request.current_age,
            retirement_age=request.retirement_age,
            current_savings=request.current_savings,
            monthly_contribution=request.monthly_contribution
        )
        
        # Generate additional personalized advice
        retirement_query = f"""
        Analyze this retirement plan for a {request.user_context.get('userType', 'person')}:
        
        - Current Age: {request.current_age}
        - Retirement Age: {request.retirement_age}
        - Current Savings: ${request.current_savings:,.2f}
        - Monthly Contributions: ${request.monthly_contribution:,.2f}
        - Current Income: ${request.current_income:,.2f}
        - Desired Retirement Income: ${request.desired_income:,.2f}
        - Number of Accounts: {len(request.accounts)}
        
        Provide specific, actionable recommendations to improve their retirement readiness.
        """
        
        advice = await gemini_service.generate_financial_advice(
            query=retirement_query,
            user_context=request.user_context
        )
        
        # Calculate additional metrics
        years_to_retirement = request.retirement_age - request.current_age
        replacement_ratio = (request.desired_income / request.current_income * 100) if request.current_income > 0 else 70
        
        # Determine adequacy based on projected balance and desired income
        annual_desired = request.desired_income
        projected_annual_income = projection.get("monthly_income", 0) * 12
        adequacy_ratio = (projected_annual_income / annual_desired) if annual_desired > 0 else 0
        
        if adequacy_ratio >= 1.0:
            adequacy = "Excellent"
        elif adequacy_ratio >= 0.8:
            adequacy = "On Track"
        elif adequacy_ratio >= 0.6:
            adequacy = "Needs Improvement"
        else:
            adequacy = "Critical"
        
        # Generate specific recommendations based on analysis
        recommendations = []
        
        if request.monthly_contribution < request.current_income * 0.1 / 12:
            recommendations.append("Consider increasing monthly contributions to at least 10% of income")
        
        if years_to_retirement > 10 and request.current_age < 50:
            recommendations.append("Take advantage of compound growth by maximizing contributions while young")
        
        if len(request.accounts) == 1:
            recommendations.append("Diversify with multiple account types (401k, IRA, Roth IRA) for tax flexibility")
        
        if request.current_age >= 50:
            recommendations.append("Utilize catch-up contributions to accelerate savings")
        
        if adequacy_ratio < 0.8:
            recommendations.append(f"Consider working {1-2} additional years or reducing retirement expenses")
        
        recommendations.append("Review and rebalance investment allocation annually")
        recommendations.append("Consider consulting with a financial advisor for personalized strategies")
        
        return {
            "projected_balance": projection.get("projected_balance", 0),
            "monthly_income": projection.get("monthly_income", 0),
            "adequacy": adequacy,
            "recommendations": recommendations,
            "additional_analysis": {
                "years_to_retirement": years_to_retirement,
                "replacement_ratio": replacement_ratio,
                "adequacy_ratio": adequacy_ratio,
                "personalized_advice": advice
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retirement planning failed: {str(e)}")

@router.post("/retirement-optimization")
async def get_retirement_optimization_tips(request: RetirementPlanningRequest):
    """Get optimization tips for retirement planning"""
    try:
        optimization_query = f"""
        Provide retirement optimization strategies for:
        - Age {request.current_age}, retiring at {request.retirement_age}
        - Current savings: ${request.current_savings:,.2f}
        - Monthly contributions: ${request.monthly_contribution:,.2f}
        - Income: ${request.current_income:,.2f}
        - User type: {request.user_context.get('userType', 'individual')}
        
        Focus on actionable strategies to maximize retirement savings.
        """
        
        optimization_advice = await gemini_service.generate_financial_advice(
            query=optimization_query,
            user_context=request.user_context
        )
        
        # Calculate potential improvements
        current_annual = request.monthly_contribution * 12
        recommended_annual = max(current_annual, request.current_income * 0.15)  # 15% of income
        additional_needed = recommended_annual - current_annual
        
        return {
            "optimization_advice": optimization_advice,
            "current_savings_rate": (current_annual / request.current_income * 100) if request.current_income > 0 else 0,
            "recommended_savings_rate": 15,
            "additional_monthly_needed": additional_needed / 12,
            "quick_wins": [
                "Increase 401(k) contribution by 1% annually",
                "Automate IRA contributions",
                "Invest tax refunds in retirement accounts",
                "Reduce fees by choosing low-cost index funds",
                "Take advantage of employer match programs"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retirement optimization failed: {str(e)}")
