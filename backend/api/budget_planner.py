from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from backend.services.gemini_service import gemini_service

router = APIRouter()

class BudgetAnalysisRequest(BaseModel):
    income: float
    expenses: Dict[str, float]
    user_context: Dict[str, Any]

@router.post("/budget-analysis")
async def analyze_budget(request: BudgetAnalysisRequest):
    """Analyze budget and provide AI-powered recommendations"""
    try:
        analysis = await gemini_service.analyze_budget(
            income=request.income,
            expenses=request.expenses,
            user_context=request.user_context
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget analysis failed: {str(e)}")

@router.post("/budget-optimization")
async def optimize_budget(request: BudgetAnalysisRequest):
    """Get budget optimization suggestions"""
    try:
        # Calculate current spending patterns
        total_expenses = sum(request.expenses.values())
        savings_rate = (request.income - total_expenses) / request.income if request.income > 0 else 0
        
        # Generate optimization advice
        optimization_advice = await gemini_service.generate_financial_advice(
            query=f"Optimize my budget with {savings_rate:.1%} savings rate",
            user_context=request.user_context
        )
        
        return {
            "current_savings_rate": savings_rate,
            "optimization_advice": optimization_advice,
            "recommended_changes": [
                "Reduce dining out expenses by 20%",
                "Set up automatic savings transfers",
                "Review subscription services monthly"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget optimization failed: {str(e)}")
