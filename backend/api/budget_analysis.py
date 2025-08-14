from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging
from datetime import datetime

from ..models.financial_models import UserFinancialProfile, Transaction, BudgetCategory
from ..services.budget_analysis import budget_engine
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/budget", tags=["budget_analysis"])

class BudgetCreationRequest(BaseModel):
    user_profile: UserFinancialProfile

class BudgetAnalysisRequest(BaseModel):
    user_profile: UserFinancialProfile
    budget_categories: List[BudgetCategory]
    transactions: List[Transaction]
    analysis_period: str = "monthly"

class BudgetOptimizationRequest(BaseModel):
    user_profile: UserFinancialProfile
    budget_summary: dict  # BudgetSummary as dict
    optimization_goal: str = "increase_savings"

@router.post("/create-recommended")
async def create_recommended_budget(request: BudgetCreationRequest):
    """
    Create a recommended budget based on user profile and demographic
    
    Delivers AI-generated budget summaries tailored to:
    - Student vs Professional demographics
    - Income level and financial goals
    - Best practice allocation percentages
    """
    try:
        logger.info(f"Creating recommended budget for user: {request.user_profile.user_id}")
        
        recommended_budget = budget_engine.create_recommended_budget(request.user_profile)
        
        return recommended_budget
        
    except Exception as e:
        logger.error(f"Error creating recommended budget: {e}")
        raise HTTPException(status_code=500, detail="Error creating recommended budget")

@router.post("/analyze-performance")
async def analyze_budget_performance(request: BudgetAnalysisRequest):
    """
    Analyze budget performance against actual spending
    
    Provides detailed analysis including:
    - Category-wise variance analysis
    - Savings rate calculation
    - AI-generated insights and recommendations
    - Budget health scoring
    """
    try:
        logger.info(f"Analyzing budget performance for user: {request.user_profile.user_id}")
        
        # Analyze budget performance
        budget_summary = budget_engine.analyze_budget_performance(
            user_profile=request.user_profile,
            budget_categories=request.budget_categories,
            transactions=request.transactions,
            analysis_period=request.analysis_period
        )
        
        # Generate health score
        health_score = budget_engine.generate_budget_health_score(budget_summary)
        
        return {
            "budget_summary": budget_summary.dict(),
            "health_score": health_score,
            "analysis_date": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing budget performance: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing budget performance")

@router.post("/optimize")
async def optimize_budget(request: BudgetOptimizationRequest):
    """
    Generate budget optimization recommendations
    
    Provides actionable optimization strategies:
    - Category-specific reduction opportunities
    - Demographic-aware optimization strategies
    - Implementation timeline
    - Success metrics and tracking
    """
    try:
        logger.info(f"Optimizing budget for user: {request.user_profile.user_id}")
        
        # Convert dict back to BudgetSummary object (simplified for this example)
        from ..models.financial_models import BudgetSummary
        budget_summary = BudgetSummary(**request.budget_summary)
        
        optimization = budget_engine.optimize_budget(
            user_profile=request.user_profile,
            budget_summary=budget_summary,
            optimization_goal=request.optimization_goal
        )
        
        return optimization
        
    except Exception as e:
        logger.error(f"Error optimizing budget: {e}")
        raise HTTPException(status_code=500, detail="Error optimizing budget")

@router.post("/forecast")
async def generate_budget_forecast(
    user_profile: UserFinancialProfile,
    budget_summary: dict,
    months_ahead: int = 12
):
    """
    Generate budget forecasts and projections
    
    Provides forward-looking analysis:
    - Monthly income and expense projections
    - Cumulative savings forecasts
    - Inflation and growth adjustments
    - Long-term financial trajectory insights
    """
    try:
        logger.info(f"Generating budget forecast for user: {user_profile.user_id}")
        
        # Convert dict to BudgetSummary
        from ..models.financial_models import BudgetSummary
        budget_summary_obj = BudgetSummary(**budget_summary)
        
        forecast = budget_engine.generate_budget_forecast(
            user_profile=user_profile,
            budget_summary=budget_summary_obj,
            months_ahead=months_ahead
        )
        
        return forecast
        
    except Exception as e:
        logger.error(f"Error generating budget forecast: {e}")
        raise HTTPException(status_code=500, detail="Error generating budget forecast")

@router.get("/templates/{demographic}")
async def get_budget_template(demographic: str):
    """Get budget template for specific demographic"""
    try:
        from ..models.financial_models import DemographicType
        
        if demographic not in ["student", "professional"]:
            raise HTTPException(status_code=400, detail="Invalid demographic")
        
        demo_type = DemographicType.STUDENT if demographic == "student" else DemographicType.PROFESSIONAL
        template = budget_engine.BUDGET_TEMPLATES[demo_type]
        
        return {
            "demographic": demographic,
            "template": {category.value: percentage for category, percentage in template.items()},
            "description": f"Recommended budget allocation for {demographic}s"
        }
        
    except Exception as e:
        logger.error(f"Error getting budget template: {e}")
        raise HTTPException(status_code=500, detail="Error getting budget template")

@router.post("/health-score")
async def calculate_budget_health_score(budget_summary: dict):
    """Calculate comprehensive budget health score"""
    try:
        from ..models.financial_models import BudgetSummary
        budget_summary_obj = BudgetSummary(**budget_summary)
        
        health_score = budget_engine.generate_budget_health_score(budget_summary_obj)
        
        return health_score
        
    except Exception as e:
        logger.error(f"Error calculating budget health score: {e}")
        raise HTTPException(status_code=500, detail="Error calculating budget health score")
