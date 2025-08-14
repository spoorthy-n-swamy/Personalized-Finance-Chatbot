from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
import logging

from ..models.financial_models import (
    UserFinancialProfile, DemographicType, ExpenseCategory, 
    BudgetCategory, BudgetSummary, Transaction
)

logger = logging.getLogger(__name__)

class BudgetAnalysisEngine:
    """
    AI-powered budget analysis system that generates detailed, 
    easy-to-understand budget summaries
    """
    
    def __init__(self):
        # Standard budget allocation percentages by demographic
        self.BUDGET_TEMPLATES = {
            DemographicType.STUDENT: {
                ExpenseCategory.HOUSING: 0.30,      # 30% - dorms, rent
                ExpenseCategory.FOOD: 0.20,         # 20% - meal plans, groceries
                ExpenseCategory.TRANSPORTATION: 0.10, # 10% - bus, car
                ExpenseCategory.EDUCATION: 0.15,     # 15% - books, supplies
                ExpenseCategory.ENTERTAINMENT: 0.10, # 10% - social activities
                ExpenseCategory.HEALTHCARE: 0.05,    # 5% - basic health needs
                ExpenseCategory.SAVINGS: 0.10        # 10% - emergency fund
            },
            DemographicType.PROFESSIONAL: {
                ExpenseCategory.HOUSING: 0.28,       # 28% - rent/mortgage
                ExpenseCategory.FOOD: 0.12,          # 12% - groceries, dining
                ExpenseCategory.TRANSPORTATION: 0.15, # 15% - car, commute
                ExpenseCategory.UTILITIES: 0.08,     # 8% - electricity, internet
                ExpenseCategory.HEALTHCARE: 0.08,    # 8% - insurance, medical
                ExpenseCategory.ENTERTAINMENT: 0.08, # 8% - hobbies, travel
                ExpenseCategory.SHOPPING: 0.06,      # 6% - clothing, misc
                ExpenseCategory.SAVINGS: 0.15        # 15% - retirement, emergency
            }
        }
        
        # Budget health thresholds
        self.HEALTH_THRESHOLDS = {
            "excellent": 0.95,  # Within 5% of budget
            "good": 0.90,       # Within 10% of budget
            "fair": 0.80,       # Within 20% of budget
            "poor": 0.70        # More than 30% over budget
        }
    
    def create_recommended_budget(
        self, 
        user_profile: UserFinancialProfile
    ) -> Dict[str, any]:
        """Create a recommended budget based on user profile and demographic"""
        
        monthly_income = user_profile.monthly_income
        template = self.BUDGET_TEMPLATES[user_profile.demographic]
        
        # Create budget categories
        budget_categories = []
        total_allocated = 0
        
        for category, percentage in template.items():
            amount = monthly_income * percentage
            budget_categories.append(BudgetCategory(
                category=category,
                budgeted_amount=amount,
                percentage_of_income=percentage * 100
            ))
            total_allocated += amount
        
        # Add remaining categories with minimal allocation
        all_categories = set(ExpenseCategory)
        used_categories = set(template.keys())
        remaining_categories = all_categories - used_categories
        
        remaining_budget = monthly_income - total_allocated
        if remaining_categories and remaining_budget > 0:
            per_category = remaining_budget / len(remaining_categories)
            for category in remaining_categories:
                budget_categories.append(BudgetCategory(
                    category=category,
                    budgeted_amount=per_category,
                    percentage_of_income=(per_category / monthly_income) * 100
                ))
        
        return {
            "user_id": user_profile.user_id,
            "demographic": user_profile.demographic,
            "monthly_income": monthly_income,
            "budget_categories": budget_categories,
            "total_budgeted": sum(cat.budgeted_amount for cat in budget_categories),
            "created_at": datetime.now(),
            "recommendations": self._generate_budget_recommendations(user_profile, budget_categories)
        }
    
    def analyze_budget_performance(
        self,
        user_profile: UserFinancialProfile,
        budget_categories: List[BudgetCategory],
        transactions: List[Transaction],
        analysis_period: str = "monthly"
    ) -> BudgetSummary:
        """Analyze budget performance against actual spending"""
        
        # Calculate actual spending by category
        actual_spending = defaultdict(float)
        for transaction in transactions:
            actual_spending[transaction.category] += transaction.amount
        
        # Update budget categories with actual amounts
        updated_categories = []
        total_budgeted = 0
        total_actual = 0
        
        for category in budget_categories:
            actual_amount = actual_spending.get(category.category, 0.0)
            updated_category = BudgetCategory(
                category=category.category,
                budgeted_amount=category.budgeted_amount,
                actual_amount=actual_amount,
                percentage_of_income=category.percentage_of_income
            )
            updated_categories.append(updated_category)
            total_budgeted += category.budgeted_amount
            total_actual += actual_amount
        
        # Calculate savings
        total_savings = user_profile.monthly_income - total_actual
        savings_rate = total_savings / user_profile.monthly_income if user_profile.monthly_income > 0 else 0
        
        # Generate AI-powered recommendations
        recommendations = self._generate_ai_budget_insights(
            user_profile, updated_categories, total_actual, total_savings
        )
        
        return BudgetSummary(
            user_id=user_profile.user_id,
            total_income=user_profile.monthly_income,
            total_expenses=total_actual,
            total_savings=total_savings,
            savings_rate=savings_rate,
            categories=updated_categories,
            recommendations=recommendations
        )
    
    def generate_budget_health_score(
        self, 
        budget_summary: BudgetSummary
    ) -> Dict[str, any]:
        """Generate a comprehensive budget health score"""
        
        category_scores = []
        total_variance = 0
        categories_over_budget = 0
        
        for category in budget_summary.categories:
            if category.budgeted_amount > 0:
                variance = (category.actual_amount - category.budgeted_amount) / category.budgeted_amount
                total_variance += abs(variance)
                
                if category.actual_amount > category.budgeted_amount:
                    categories_over_budget += 1
                
                # Category health score
                if variance <= 0.05:  # Within 5%
                    score = "excellent"
                elif variance <= 0.15:  # Within 15%
                    score = "good"
                elif variance <= 0.30:  # Within 30%
                    score = "fair"
                else:
                    score = "poor"
                
                category_scores.append({
                    "category": category.category.value,
                    "variance": variance,
                    "score": score,
                    "over_budget": category.actual_amount > category.budgeted_amount
                })
        
        # Overall health score
        avg_variance = total_variance / len(category_scores) if category_scores else 0
        
        if avg_variance <= 0.10:
            overall_health = "excellent"
        elif avg_variance <= 0.20:
            overall_health = "good"
        elif avg_variance <= 0.35:
            overall_health = "fair"
        else:
            overall_health = "poor"
        
        # Savings rate health
        savings_health = "excellent" if budget_summary.savings_rate >= 0.20 else \
                        "good" if budget_summary.savings_rate >= 0.15 else \
                        "fair" if budget_summary.savings_rate >= 0.10 else "poor"
        
        return {
            "overall_health": overall_health,
            "savings_health": savings_health,
            "average_variance": round(avg_variance * 100, 2),
            "categories_over_budget": categories_over_budget,
            "total_categories": len(category_scores),
            "category_scores": category_scores,
            "health_summary": self._generate_health_summary(overall_health, savings_health, categories_over_budget)
        }
    
    def optimize_budget(
        self,
        user_profile: UserFinancialProfile,
        budget_summary: BudgetSummary,
        optimization_goal: str = "increase_savings"
    ) -> Dict[str, any]:
        """Generate budget optimization recommendations"""
        
        optimizations = []
        potential_savings = 0
        
        # Analyze each category for optimization opportunities
        for category in budget_summary.categories:
            if category.actual_amount > 0:
                optimization = self._analyze_category_optimization(
                    category, user_profile.demographic, optimization_goal
                )
                if optimization:
                    optimizations.append(optimization)
                    potential_savings += optimization.get("potential_savings", 0)
        
        # Generate demographic-specific optimization strategies
        demographic_strategies = self._get_demographic_optimization_strategies(
            user_profile, budget_summary
        )
        
        return {
            "optimization_goal": optimization_goal,
            "category_optimizations": optimizations,
            "potential_monthly_savings": round(potential_savings, 2),
            "potential_annual_savings": round(potential_savings * 12, 2),
            "demographic_strategies": demographic_strategies,
            "implementation_timeline": self._create_optimization_timeline(optimizations),
            "success_metrics": self._define_success_metrics(optimization_goal, potential_savings)
        }
    
    def generate_budget_forecast(
        self,
        user_profile: UserFinancialProfile,
        budget_summary: BudgetSummary,
        months_ahead: int = 12
    ) -> Dict[str, any]:
        """Generate budget forecasts and projections"""
        
        # Calculate trends from current spending
        monthly_projections = []
        cumulative_savings = 0
        
        for month in range(1, months_ahead + 1):
            # Project income growth (assume 3% annual increase for professionals, 0% for students)
            income_growth = 0.03 / 12 if user_profile.demographic == DemographicType.PROFESSIONAL else 0
            projected_income = user_profile.monthly_income * (1 + income_growth * month)
            
            # Project expenses (assume 2% annual inflation)
            expense_growth = 0.02 / 12
            projected_expenses = budget_summary.total_expenses * (1 + expense_growth * month)
            
            # Calculate projected savings
            monthly_savings = projected_income - projected_expenses
            cumulative_savings += monthly_savings
            
            monthly_projections.append({
                "month": month,
                "projected_income": round(projected_income, 2),
                "projected_expenses": round(projected_expenses, 2),
                "projected_savings": round(monthly_savings, 2),
                "cumulative_savings": round(cumulative_savings, 2)
            })
        
        # Generate insights about the forecast
        forecast_insights = self._generate_forecast_insights(
            monthly_projections, user_profile
        )
        
        return {
            "forecast_period": f"{months_ahead} months",
            "monthly_projections": monthly_projections,
            "total_projected_savings": round(cumulative_savings, 2),
            "average_monthly_savings": round(cumulative_savings / months_ahead, 2),
            "insights": forecast_insights,
            "recommendations": self._generate_forecast_recommendations(monthly_projections, user_profile)
        }
    
    # Helper methods for AI-generated insights
    def _generate_budget_recommendations(
        self, 
        user_profile: UserFinancialProfile, 
        budget_categories: List[BudgetCategory]
    ) -> List[str]:
        """Generate AI-powered budget recommendations"""
        
        recommendations = []
        
        if user_profile.demographic == DemographicType.STUDENT:
            recommendations.extend([
                "Track every expense for the first month to understand spending patterns",
                "Use student discounts whenever possible to reduce costs",
                "Consider meal planning to reduce food expenses",
                "Look for free campus activities for entertainment"
            ])
        else:
            recommendations.extend([
                "Automate savings transfers to ensure consistent saving",
                "Review and negotiate recurring subscriptions quarterly",
                "Consider the 24-hour rule for non-essential purchases over $100",
                "Track net worth monthly to monitor financial progress"
            ])
        
        # Add category-specific recommendations
        housing_budget = next((cat for cat in budget_categories if cat.category == ExpenseCategory.HOUSING), None)
        if housing_budget and housing_budget.percentage_of_income > 30:
            recommendations.append("Consider reducing housing costs - aim for less than 30% of income")
        
        return recommendations
    
    def _generate_ai_budget_insights(
        self,
        user_profile: UserFinancialProfile,
        categories: List[BudgetCategory],
        total_actual: float,
        total_savings: float
    ) -> List[str]:
        """Generate AI-powered insights about budget performance"""
        
        insights = []
        
        # Savings rate analysis
        savings_rate = total_savings / user_profile.monthly_income if user_profile.monthly_income > 0 else 0
        
        if savings_rate < 0:
            insights.append("⚠️ You're spending more than you earn. Focus on reducing expenses immediately.")
        elif savings_rate < 0.10:
            insights.append("💡 Your savings rate is below 10%. Try to increase it gradually to build financial security.")
        elif savings_rate >= 0.20:
            insights.append("🎉 Excellent savings rate! You're on track for strong financial health.")
        
        # Category analysis
        overspent_categories = [cat for cat in categories if cat.actual_amount > cat.budgeted_amount * 1.1]
        if overspent_categories:
            category_names = [cat.category.value for cat in overspent_categories[:2]]
            insights.append(f"📊 You overspent in {', '.join(category_names)}. Consider setting up alerts for these categories.")
        
        # Demographic-specific insights
        if user_profile.demographic == DemographicType.STUDENT:
            food_category = next((cat for cat in categories if cat.category == ExpenseCategory.FOOD), None)
            if food_category and food_category.actual_amount > food_category.budgeted_amount * 1.2:
                insights.append("🍕 Food spending is high. Try meal prepping and cooking at home to save money.")
        else:
            entertainment_cat = next((cat for cat in categories if cat.category == ExpenseCategory.ENTERTAINMENT), None)
            if entertainment_cat and entertainment_cat.actual_amount > entertainment_cat.budgeted_amount * 1.3:
                insights.append("🎬 Entertainment spending is above budget. Look for free or low-cost activities.")
        
        return insights
    
    def _analyze_category_optimization(
        self, 
        category: BudgetCategory, 
        demographic: DemographicType,
        goal: str
    ) -> Optional[Dict[str, any]]:
        """Analyze optimization opportunities for a specific category"""
        
        if category.actual_amount <= category.budgeted_amount:
            return None  # Already within budget
        
        overspend = category.actual_amount - category.budgeted_amount
        
        optimization_strategies = {
            ExpenseCategory.FOOD: {
                "strategies": ["Meal planning", "Cook at home more", "Use grocery store apps for deals"],
                "potential_reduction": 0.20  # 20% reduction possible
            },
            ExpenseCategory.ENTERTAINMENT: {
                "strategies": ["Find free activities", "Use streaming services instead of movies", "Host potluck dinners"],
                "potential_reduction": 0.30
            },
            ExpenseCategory.SHOPPING: {
                "strategies": ["Wait 24 hours before purchases", "Use cashback apps", "Buy generic brands"],
                "potential_reduction": 0.25
            },
            ExpenseCategory.TRANSPORTATION: {
                "strategies": ["Use public transport", "Carpool", "Combine errands into one trip"],
                "potential_reduction": 0.15
            }
        }
        
        if category.category not in optimization_strategies:
            return None
        
        strategy_info = optimization_strategies[category.category]
        potential_savings = overspend * strategy_info["potential_reduction"]
        
        return {
            "category": category.category.value,
            "current_overspend": round(overspend, 2),
            "potential_savings": round(potential_savings, 2),
            "strategies": strategy_info["strategies"],
            "difficulty": "easy" if potential_savings < 50 else "moderate"
        }
    
    def _get_demographic_optimization_strategies(
        self, 
        user_profile: UserFinancialProfile, 
        budget_summary: BudgetSummary
    ) -> List[str]:
        """Get demographic-specific optimization strategies"""
        
        if user_profile.demographic == DemographicType.STUDENT:
            return [
                "Apply for additional scholarships and grants",
                "Look for part-time work or paid internships",
                "Take advantage of student discounts and free campus resources",
                "Consider sharing textbooks or buying used ones"
            ]
        else:
            return [
                "Negotiate bills (phone, internet, insurance) annually",
                "Maximize employer benefits and HSA contributions",
                "Consider refinancing loans if rates have dropped",
                "Automate investments to take advantage of dollar-cost averaging"
            ]
    
    def _create_optimization_timeline(self, optimizations: List[Dict]) -> List[Dict[str, str]]:
        """Create an implementation timeline for optimizations"""
        
        timeline = []
        
        # Sort by difficulty and potential impact
        easy_wins = [opt for opt in optimizations if opt.get("difficulty") == "easy"]
        moderate_changes = [opt for opt in optimizations if opt.get("difficulty") == "moderate"]
        
        # Week 1-2: Easy wins
        if easy_wins:
            timeline.append({
                "timeframe": "Week 1-2",
                "actions": f"Implement easy changes in {', '.join([opt['category'] for opt in easy_wins[:2]])}"
            })
        
        # Month 1: Moderate changes
        if moderate_changes:
            timeline.append({
                "timeframe": "Month 1",
                "actions": f"Work on {', '.join([opt['category'] for opt in moderate_changes[:2]])}"
            })
        
        # Month 2-3: Review and adjust
        timeline.append({
            "timeframe": "Month 2-3",
            "actions": "Review progress and fine-tune budget allocations"
        })
        
        return timeline
    
    def _define_success_metrics(self, goal: str, potential_savings: float) -> List[str]:
        """Define success metrics for budget optimization"""
        
        metrics = [
            f"Reduce monthly expenses by ${potential_savings:.0f}",
            "Stay within budget for 3 consecutive months",
            "Increase savings rate by 5 percentage points"
        ]
        
        if goal == "increase_savings":
            metrics.append(f"Build emergency fund by ${potential_savings * 6:.0f} in 6 months")
        elif goal == "debt_payoff":
            metrics.append("Apply all savings to debt reduction")
        
        return metrics
    
    def _generate_forecast_insights(
        self, 
        projections: List[Dict], 
        user_profile: UserFinancialProfile
    ) -> List[str]:
        """Generate insights about budget forecasts"""
        
        insights = []
        
        final_savings = projections[-1]["cumulative_savings"]
        avg_monthly_savings = final_savings / len(projections)
        
        if final_savings > 0:
            insights.append(f"💰 You're projected to save ${final_savings:,.0f} over the next {len(projections)} months")
            
            if user_profile.demographic == DemographicType.STUDENT:
                insights.append("🎓 This savings could help with post-graduation expenses or student loan payments")
            else:
                insights.append("📈 Consider investing these savings for long-term wealth building")
        else:
            insights.append("⚠️ Current trajectory shows negative savings. Budget adjustments needed")
        
        # Inflation impact
        insights.append("📊 Projections include 2% annual inflation - review budget quarterly to stay on track")
        
        return insights
    
    def _generate_forecast_recommendations(
        self, 
        projections: List[Dict], 
        user_profile: UserFinancialProfile
    ) -> List[str]:
        """Generate recommendations based on forecast"""
        
        recommendations = []
        
        avg_savings = sum(p["projected_savings"] for p in projections) / len(projections)
        
        if avg_savings > 500:
            recommendations.extend([
                "Consider increasing retirement contributions",
                "Build a larger emergency fund",
                "Explore investment opportunities"
            ])
        elif avg_savings > 0:
            recommendations.extend([
                "Focus on building emergency fund first",
                "Look for ways to increase income",
                "Optimize current expenses"
            ])
        else:
            recommendations.extend([
                "Immediate budget review needed",
                "Consider additional income sources",
                "Cut non-essential expenses"
            ])
        
        return recommendations
    
    def _generate_health_summary(
        self, 
        overall_health: str, 
        savings_health: str, 
        categories_over_budget: int
    ) -> str:
        """Generate a summary of budget health"""
        
        if overall_health == "excellent" and savings_health == "excellent":
            return "🌟 Outstanding budget management! You're on track for excellent financial health."
        elif overall_health == "good" and savings_health in ["good", "excellent"]:
            return "✅ Good budget control with solid savings. Minor adjustments could optimize further."
        elif categories_over_budget > 3:
            return "⚠️ Multiple categories over budget. Focus on expense tracking and reduction."
        else:
            return "📊 Budget needs attention. Review spending patterns and adjust allocations."

# Global budget analysis engine instance
budget_engine = BudgetAnalysisEngine()
