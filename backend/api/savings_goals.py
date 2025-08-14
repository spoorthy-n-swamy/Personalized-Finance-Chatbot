from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.services.gemini_service import gemini_service

router = APIRouter()

class SavingsGoal(BaseModel):
    name: str
    target: float
    current: float
    monthly: float
    category: str
    priority: str

class SavingsRecommendationRequest(BaseModel):
    goals: List[SavingsGoal]
    user_context: Dict[str, Any]

@router.post("/savings-recommendations")
async def get_savings_recommendations(request: SavingsRecommendationRequest):
    """Get AI-powered savings goal recommendations"""
    try:
        # Generate personalized savings advice
        goals_summary = "\n".join([
            f"- {goal.name}: ${goal.current:,.2f} / ${goal.target:,.2f} (${goal.monthly}/month, {goal.priority} priority)"
            for goal in request.goals
        ])
        
        advice_query = f"""
        Analyze these savings goals for a {request.user_context.get('userType', 'user')}:
        
        {goals_summary}
        
        Provide specific recommendations for:
        1. Optimal monthly contribution amounts
        2. Goal prioritization strategy
        3. Timeline adjustments
        4. Money-saving tips for each category
        """
        
        advice = await gemini_service.generate_financial_advice(
            query=advice_query,
            user_context=request.user_context
        )
        
        # Generate structured recommendations
        recommendations = []
        for goal in request.goals:
            remaining = goal.target - goal.current
            if remaining > 0:
                # Calculate optimal monthly contribution
                optimal_monthly = max(goal.monthly, remaining / 12)  # At least current or 1-year timeline
                
                recommendations.append({
                    "goal_name": goal.name,
                    "recommended_monthly": round(optimal_monthly),
                    "timeline_months": max(1, round(remaining / optimal_monthly)) if optimal_monthly > 0 else 12,
                    "priority_level": goal.priority,
                    "tips": [
                        f"Automate transfers of ${optimal_monthly:.0f} monthly",
                        f"Track progress weekly to stay motivated",
                        f"Consider high-yield savings account for {goal.category.lower()} funds",
                        f"Review and adjust monthly based on income changes"
                    ]
                })
        
        return {
            "recommendations": recommendations,
            "general_advice": advice,
            "total_monthly_needed": sum(rec["recommended_monthly"] for rec in recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Savings recommendations failed: {str(e)}")

@router.post("/goal-progress-tips")
async def get_progress_tips(request: SavingsRecommendationRequest):
    """Get tips to accelerate savings goal progress"""
    try:
        tips_query = f"""
        Provide actionable tips to accelerate savings for a {request.user_context.get('userType', 'user')} with these goals:
        
        {len(request.goals)} active savings goals
        Total target: ${sum(goal.target for goal in request.goals):,.2f}
        Current progress: ${sum(goal.current for goal in request.goals):,.2f}
        
        Focus on practical, immediate actions they can take.
        """
        
        tips = await gemini_service.generate_financial_advice(
            query=tips_query,
            user_context=request.user_context
        )
        
        return {
            "tips": tips,
            "quick_wins": [
                "Set up automatic transfers on payday",
                "Use the 52-week savings challenge",
                "Round up purchases to nearest dollar",
                "Sell unused items for extra savings",
                "Take advantage of cashback apps"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progress tips failed: {str(e)}")
