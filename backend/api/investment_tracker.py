from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.services.gemini_service import gemini_service

router = APIRouter()

class InvestmentAnalysisRequest(BaseModel):
    portfolio: Dict[str, Any]
    user_context: Dict[str, Any]

@router.post("/investment-analysis")
async def analyze_investments(request: InvestmentAnalysisRequest):
    """Analyze investment portfolio and provide AI-powered recommendations"""
    try:
        analysis = await gemini_service.generate_investment_insights(
            portfolio=request.portfolio,
            user_context=request.user_context
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investment analysis failed: {str(e)}")

@router.post("/market-insights")
async def get_market_insights(request: InvestmentAnalysisRequest):
    """Get current market insights and trends"""
    try:
        market_advice = await gemini_service.generate_financial_advice(
            query="Provide current market insights and investment opportunities",
            user_context=request.user_context
        )
        
        return {
            "market_summary": market_advice,
            "trending_sectors": ["Technology", "Healthcare", "Renewable Energy"],
            "risk_factors": ["Inflation concerns", "Interest rate changes", "Geopolitical tensions"],
            "opportunities": ["AI and automation stocks", "ESG investments", "Emerging markets"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market insights failed: {str(e)}")
