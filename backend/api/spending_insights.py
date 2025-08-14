from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging
from datetime import datetime

from ..models.financial_models import UserFinancialProfile, Transaction
from ..services.spending_insights import spending_engine
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/spending-insights", tags=["spending_insights"])

class SpendingAnalysisRequest(BaseModel):
    user_profile: UserFinancialProfile
    transactions: List[Transaction]
    analysis_period_days: int = 90

class SpendingOptimizationRequest(BaseModel):
    user_profile: UserFinancialProfile
    transactions: List[Transaction]
    optimization_focus: str = "general"  # "general", "category", "frequency"

@router.post("/comprehensive-analysis")
async def get_comprehensive_spending_insights(request: SpendingAnalysisRequest):
    """
    Generate comprehensive spending insights and suggestions
    
    Provides actionable insights on spending habits including:
    - Spending pattern analysis
    - Category benchmarking
    - Trend identification
    - Anomaly detection
    - Merchant analysis
    - Optimization opportunities
    - Behavioral insights
    """
    try:
        logger.info(f"Generating spending insights for user: {request.user_profile.user_id}")
        
        insights = spending_engine.generate_comprehensive_insights(
            user_profile=request.user_profile,
            transactions=request.transactions,
            analysis_period_days=request.analysis_period_days
        )
        
        return insights
        
    except Exception as e:
        logger.error(f"Error generating spending insights: {e}")
        raise HTTPException(status_code=500, detail="Error generating spending insights")

@router.post("/optimization-suggestions")
async def get_optimization_suggestions(request: SpendingOptimizationRequest):
    """
    Get specific optimization suggestions based on spending patterns
    
    Provides targeted recommendations to:
    - Reduce category overspending
    - Optimize subscription spending
    - Minimize impulse purchases
    - Improve spending efficiency
    """
    try:
        logger.info(f"Generating optimization suggestions for user: {request.user_profile.user_id}")
        
        # Generate comprehensive insights first
        insights = spending_engine.generate_comprehensive_insights(
            user_profile=request.user_profile,
            transactions=request.transactions
        )
        
        # Extract optimization opportunities
        opportunities = insights["insights"].get("optimization_opportunities", [])
        recommendations = insights.get("recommendations", [])
        
        return {
            "optimization_focus": request.optimization_focus,
            "opportunities": opportunities,
            "recommendations": recommendations,
            "potential_total_savings": sum(opp.get("potential_monthly_savings", 0) for opp in opportunities),
            "implementation_priority": sorted(opportunities, key=lambda x: x.get("potential_monthly_savings", 0), reverse=True)[:3]
        }
        
    except Exception as e:
        logger.error(f"Error generating optimization suggestions: {e}")
        raise HTTPException(status_code=500, detail="Error generating optimization suggestions")

@router.post("/spending-patterns")
async def analyze_spending_patterns(request: SpendingAnalysisRequest):
    """Analyze detailed spending patterns and behaviors"""
    try:
        insights = spending_engine.generate_comprehensive_insights(
            user_profile=request.user_profile,
            transactions=request.transactions,
            analysis_period_days=request.analysis_period_days
        )
        
        return {
            "spending_patterns": insights["insights"].get("spending_patterns", {}),
            "behavioral_insights": insights["insights"].get("behavioral_insights", {}),
            "trend_analysis": insights["insights"].get("trend_analysis", {}),
            "analysis_summary": {
                "total_transactions": insights.get("total_transactions", 0),
                "analysis_period": insights.get("analysis_period", ""),
                "key_findings": insights.get("recommendations", [])[:3]
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing spending patterns: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing spending patterns")

@router.post("/anomaly-detection")
async def detect_spending_anomalies(request: SpendingAnalysisRequest):
    """Detect unusual spending patterns and anomalies"""
    try:
        insights = spending_engine.generate_comprehensive_insights(
            user_profile=request.user_profile,
            transactions=request.transactions,
            analysis_period_days=request.analysis_period_days
        )
        
        anomalies = insights["insights"].get("anomaly_detection", {})
        
        return {
            "anomaly_summary": {
                "total_anomalies": anomalies.get("total_anomalies", 0),
                "anomaly_threshold": anomalies.get("anomaly_threshold", 0),
                "detection_period": request.analysis_period_days
            },
            "amount_anomalies": anomalies.get("amount_anomalies", []),
            "category_anomalies": anomalies.get("category_anomalies", []),
            "recommendations": [
                "Review flagged transactions for accuracy",
                "Set up spending alerts for unusual amounts",
                "Monitor categories with anomalous spending"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error detecting spending anomalies: {e}")
        raise HTTPException(status_code=500, detail="Error detecting spending anomalies")

@router.get("/spending-benchmarks/{demographic}")
async def get_spending_benchmarks(demographic: str):
    """Get spending benchmarks for demographic comparison"""
    try:
        from ..models.financial_models import DemographicType
        
        if demographic not in ["student", "professional"]:
            raise HTTPException(status_code=400, detail="Invalid demographic")
        
        demo_type = DemographicType.STUDENT if demographic == "student" else DemographicType.PROFESSIONAL
        benchmarks = spending_engine.SPENDING_BENCHMARKS.get(demo_type, {})
        
        return {
            "demographic": demographic,
            "benchmarks": {
                category.value: {"low": bench["low"], "high": bench["high"]} 
                for category, bench in benchmarks.items()
            },
            "description": f"Spending benchmarks for {demographic}s based on financial best practices"
        }
        
    except Exception as e:
        logger.error(f"Error getting spending benchmarks: {e}")
        raise HTTPException(status_code=500, detail="Error getting spending benchmarks")

@router.post("/category-insights")
async def get_category_insights(request: SpendingAnalysisRequest):
    """Get detailed insights for specific spending categories"""
    try:
        insights = spending_engine.generate_comprehensive_insights(
            user_profile=request.user_profile,
            transactions=request.transactions,
            analysis_period_days=request.analysis_period_days
        )
        
        category_analysis = insights["insights"].get("category_analysis", {})
        
        return {
            "category_breakdown": category_analysis.get("category_breakdown", {}),
            "top_categories": category_analysis.get("top_spending_categories", []),
            "most_frequent": category_analysis.get("most_frequent_category", ""),
            "optimization_by_category": [
                opp for opp in insights["insights"].get("optimization_opportunities", [])
                if opp.get("category") != "miscellaneous"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting category insights: {e}")
        raise HTTPException(status_code=500, detail="Error getting category insights")
