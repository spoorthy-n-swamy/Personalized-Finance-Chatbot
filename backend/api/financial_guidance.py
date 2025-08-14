from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging
from datetime import datetime

from ..models.financial_models import UserFinancialProfile
from ..services.financial_guidance import financial_engine
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/financial-guidance", tags=["financial_guidance"])

class GuidanceRequest(BaseModel):
    user_profile: UserFinancialProfile
    specific_query: Optional[str] = None

class PersonalizedAdviceRequest(BaseModel):
    user_profile: UserFinancialProfile
    advice_category: str  # "savings", "investments", "taxes", "debt", "emergency_fund"

@router.post("/comprehensive")
async def get_comprehensive_guidance(request: GuidanceRequest):
    """
    Get comprehensive financial guidance covering all areas
    
    Delivers personalized financial guidance on:
    - Emergency fund planning
    - Savings strategies
    - Investment recommendations
    - Tax optimization
    - Debt management
    - Goal-specific advice
    """
    try:
        logger.info(f"Generating comprehensive guidance for user: {request.user_profile.user_id}")
        
        guidance = financial_engine.generate_comprehensive_guidance(
            user_profile=request.user_profile,
            specific_query=request.specific_query
        )
        
        return guidance
        
    except Exception as e:
        logger.error(f"Error generating comprehensive guidance: {e}")
        raise HTTPException(status_code=500, detail="Error generating financial guidance")

@router.post("/personalized-advice")
async def get_personalized_advice(request: PersonalizedAdviceRequest):
    """
    Get specific personalized advice for a particular financial area
    """
    try:
        guidance = financial_engine.generate_comprehensive_guidance(request.user_profile)
        
        # Extract specific category advice
        category_advice = guidance["recommendations"].get(request.advice_category, {})
        
        return {
            "category": request.advice_category,
            "advice": category_advice,
            "user_demographic": request.user_profile.demographic,
            "generated_at": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error generating personalized advice: {e}")
        raise HTTPException(status_code=500, detail="Error generating personalized advice")

@router.get("/savings-calculator/{monthly_income}/{savings_rate}")
async def calculate_savings_projection(monthly_income: float, savings_rate: float, years: int = 30):
    """Calculate savings projections with compound interest"""
    try:
        annual_savings = monthly_income * 12 * (savings_rate / 100)
        
        # Calculate with different return rates
        projections = {}
        for rate_name, annual_rate in [("conservative", 0.04), ("moderate", 0.07), ("aggressive", 0.10)]:
            future_value = financial_engine._calculate_compound_interest(annual_savings, annual_rate, years)
            projections[rate_name] = {
                "annual_return": annual_rate * 100,
                "future_value": round(future_value, 2),
                "total_contributions": round(annual_savings * years, 2),
                "growth": round(future_value - (annual_savings * years), 2)
            }
        
        return {
            "monthly_income": monthly_income,
            "savings_rate": savings_rate,
            "annual_savings": round(annual_savings, 2),
            "years": years,
            "projections": projections
        }
        
    except Exception as e:
        logger.error(f"Error calculating savings projection: {e}")
        raise HTTPException(status_code=500, detail="Error calculating savings projection")

@router.get("/investment-allocation/{age}/{risk_tolerance}")
async def get_investment_allocation(age: int, risk_tolerance: str):
    """Get recommended investment allocation based on age and risk tolerance"""
    try:
        if risk_tolerance not in ["conservative", "moderate", "aggressive"]:
            raise HTTPException(status_code=400, detail="Invalid risk tolerance")
        
        stock_percentage = financial_engine.AGE_BASED_ALLOCATION[risk_tolerance](age)
        bond_percentage = 100 - stock_percentage
        
        return {
            "age": age,
            "risk_tolerance": risk_tolerance,
            "allocation": {
                "stocks": stock_percentage,
                "bonds": bond_percentage,
                "alternatives": 5 if stock_percentage > 60 else 0
            },
            "rebalancing_frequency": "quarterly",
            "explanation": f"At age {age} with {risk_tolerance} risk tolerance, allocate {stock_percentage}% to stocks for growth and {bond_percentage}% to bonds for stability."
        }
        
    except Exception as e:
        logger.error(f"Error calculating investment allocation: {e}")
        raise HTTPException(status_code=500, detail="Error calculating investment allocation")
