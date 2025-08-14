from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import statistics
import logging

from ..models.financial_models import (
    UserFinancialProfile, DemographicType, ExpenseCategory, 
    Transaction, SpendingInsight
)

logger = logging.getLogger(__name__)

class SpendingInsightsEngine:
    """
    Advanced analytics engine for spending insights and suggestions
    Provides actionable insights on spending habits and optimization recommendations
    """
    
    def __init__(self):
        # Spending pattern thresholds
        self.ANOMALY_THRESHOLD = 2.0  # Standard deviations for anomaly detection
        self.TREND_THRESHOLD = 0.15   # 15% change to identify trends
        self.HIGH_FREQUENCY_THRESHOLD = 10  # Transactions per month
        
        # Category spending benchmarks by demographic
        self.SPENDING_BENCHMARKS = {
            DemographicType.STUDENT: {
                ExpenseCategory.FOOD: {"low": 200, "high": 400},
                ExpenseCategory.ENTERTAINMENT: {"low": 50, "high": 150},
                ExpenseCategory.TRANSPORTATION: {"low": 50, "high": 200},
                ExpenseCategory.SHOPPING: {"low": 30, "high": 100}
            },
            DemographicType.PROFESSIONAL: {
                ExpenseCategory.FOOD: {"low": 300, "high": 600},
                ExpenseCategory.ENTERTAINMENT: {"low": 100, "high": 300},
                ExpenseCategory.TRANSPORTATION: {"low": 200, "high": 500},
                ExpenseCategory.SHOPPING: {"low": 100, "high": 300},
                ExpenseCategory.HEALTHCARE: {"low": 100, "high": 400}
            }
        }
    
    def generate_comprehensive_insights(
        self,
        user_profile: UserFinancialProfile,
        transactions: List[Transaction],
        analysis_period_days: int = 90
    ) -> Dict[str, Any]:
        """Generate comprehensive spending insights and recommendations"""
        
        # Filter transactions to analysis period
        cutoff_date = datetime.now() - timedelta(days=analysis_period_days)
        recent_transactions = [
            t for t in transactions 
            if t.date >= cutoff_date
        ]
        
        if not recent_transactions:
            return {"error": "No transactions found in the analysis period"}
        
        insights = {
            "user_id": user_profile.user_id,
            "analysis_period": f"{analysis_period_days} days",
            "total_transactions": len(recent_transactions),
            "analysis_date": datetime.now(),
            "insights": {}
        }
        
        # Core spending analysis
        insights["insights"]["spending_patterns"] = self._analyze_spending_patterns(
            recent_transactions, user_profile
        )
        insights["insights"]["category_analysis"] = self._analyze_category_spending(
            recent_transactions, user_profile
        )
        insights["insights"]["trend_analysis"] = self._analyze_spending_trends(
            recent_transactions, analysis_period_days
        )
        insights["insights"]["anomaly_detection"] = self._detect_spending_anomalies(
            recent_transactions
        )
        insights["insights"]["merchant_analysis"] = self._analyze_merchant_patterns(
            recent_transactions
        )
        insights["insights"]["optimization_opportunities"] = self._identify_optimization_opportunities(
            recent_transactions, user_profile
        )
        insights["insights"]["behavioral_insights"] = self._generate_behavioral_insights(
            recent_transactions, user_profile
        )
        
        # Generate actionable recommendations
        insights["recommendations"] = self._generate_spending_recommendations(
            insights["insights"], user_profile
        )
        
        return insights
    
    def _analyze_spending_patterns(
        self, 
        transactions: List[Transaction], 
        user_profile: UserFinancialProfile
    ) -> Dict[str, Any]:
        """Analyze overall spending patterns"""
        
        # Calculate basic statistics
        amounts = [t.amount for t in transactions]
        total_spending = sum(amounts)
        avg_transaction = statistics.mean(amounts) if amounts else 0
        median_transaction = statistics.median(amounts) if amounts else 0
        
        # Analyze spending frequency
        daily_spending = defaultdict(float)
        for transaction in transactions:
            date_key = transaction.date.date()
            daily_spending[date_key] += transaction.amount
        
        avg_daily_spending = total_spending / len(daily_spending) if daily_spending else 0
        
        # Analyze spending by day of week
        weekday_spending = defaultdict(list)
        for transaction in transactions:
            weekday = transaction.date.strftime("%A")
            weekday_spending[weekday].append(transaction.amount)
        
        weekday_analysis = {}
        for day, amounts in weekday_spending.items():
            weekday_analysis[day] = {
                "total": sum(amounts),
                "average": statistics.mean(amounts),
                "transaction_count": len(amounts)
            }
        
        # Find highest spending day
        highest_spending_day = max(weekday_analysis.keys(), 
                                 key=lambda x: weekday_analysis[x]["total"]) if weekday_analysis else None
        
        return {
            "total_spending": round(total_spending, 2),
            "average_transaction": round(avg_transaction, 2),
            "median_transaction": round(median_transaction, 2),
            "average_daily_spending": round(avg_daily_spending, 2),
            "transaction_frequency": len(transactions) / (len(daily_spending) or 1),
            "weekday_analysis": weekday_analysis,
            "highest_spending_day": highest_spending_day,
            "spending_consistency": self._calculate_spending_consistency(list(daily_spending.values()))
        }
    
    def _analyze_category_spending(
        self, 
        transactions: List[Transaction], 
        user_profile: UserFinancialProfile
    ) -> Dict[str, Any]:
        """Analyze spending by category with benchmarking"""
        
        category_spending = defaultdict(list)
        for transaction in transactions:
            category_spending[transaction.category].append(transaction.amount)
        
        category_analysis = {}
        benchmarks = self.SPENDING_BENCHMARKS.get(user_profile.demographic, {})
        
        for category, amounts in category_spending.items():
            total = sum(amounts)
            average = statistics.mean(amounts)
            
            # Compare to benchmarks
            benchmark = benchmarks.get(category, {})
            benchmark_status = "normal"
            if benchmark:
                if total < benchmark["low"]:
                    benchmark_status = "below_average"
                elif total > benchmark["high"]:
                    benchmark_status = "above_average"
            
            category_analysis[category.value] = {
                "total_spent": round(total, 2),
                "transaction_count": len(amounts),
                "average_transaction": round(average, 2),
                "percentage_of_total": round((total / sum(sum(amounts) for amounts in category_spending.values())) * 100, 2),
                "benchmark_status": benchmark_status,
                "benchmark_range": benchmark
            }
        
        # Find top spending categories
        sorted_categories = sorted(
            category_analysis.items(), 
            key=lambda x: x[1]["total_spent"], 
            reverse=True
        )
        
        return {
            "category_breakdown": category_analysis,
            "top_spending_categories": [cat[0] for cat in sorted_categories[:3]],
            "most_frequent_category": max(category_spending.keys(), 
                                        key=lambda x: len(category_spending[x])).value if category_spending else None
        }
    
    def _analyze_spending_trends(
        self, 
        transactions: List[Transaction], 
        period_days: int
    ) -> Dict[str, Any]:
        """Analyze spending trends over time"""
        
        # Group transactions by week
        weekly_spending = defaultdict(float)
        for transaction in transactions:
            week_start = transaction.date - timedelta(days=transaction.date.weekday())
            week_key = week_start.strftime("%Y-%W")
            weekly_spending[week_key] += transaction.amount
        
        if len(weekly_spending) < 2:
            return {"trend": "insufficient_data", "weeks_analyzed": len(weekly_spending)}
        
        # Calculate trend
        weeks = sorted(weekly_spending.keys())
        amounts = [weekly_spending[week] for week in weeks]
        
        # Simple linear trend calculation
        if len(amounts) >= 2:
            first_half_avg = statistics.mean(amounts[:len(amounts)//2])
            second_half_avg = statistics.mean(amounts[len(amounts)//2:])
            
            trend_change = (second_half_avg - first_half_avg) / first_half_avg if first_half_avg > 0 else 0
            
            if trend_change > self.TREND_THRESHOLD:
                trend_direction = "increasing"
            elif trend_change < -self.TREND_THRESHOLD:
                trend_direction = "decreasing"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "stable"
            trend_change = 0
        
        return {
            "trend_direction": trend_direction,
            "trend_change_percentage": round(trend_change * 100, 2),
            "weekly_spending": dict(weekly_spending),
            "weeks_analyzed": len(weekly_spending),
            "average_weekly_spending": round(statistics.mean(amounts), 2) if amounts else 0
        }
    
    def _detect_spending_anomalies(
        self, 
        transactions: List[Transaction]
    ) -> Dict[str, Any]:
        """Detect unusual spending patterns and anomalies"""
        
        amounts = [t.amount for t in transactions]
        if len(amounts) < 5:
            return {"anomalies": [], "note": "Insufficient data for anomaly detection"}
        
        mean_amount = statistics.mean(amounts)
        std_amount = statistics.stdev(amounts) if len(amounts) > 1 else 0
        
        anomalies = []
        for transaction in transactions:
            if std_amount > 0:
                z_score = abs(transaction.amount - mean_amount) / std_amount
                if z_score > self.ANOMALY_THRESHOLD:
                    anomalies.append({
                        "transaction_id": transaction.id,
                        "amount": transaction.amount,
                        "category": transaction.category.value,
                        "date": transaction.date.isoformat(),
                        "description": transaction.description,
                        "z_score": round(z_score, 2),
                        "anomaly_type": "high_amount" if transaction.amount > mean_amount else "low_amount"
                    })
        
        # Detect category anomalies
        category_spending = defaultdict(list)
        for transaction in transactions:
            category_spending[transaction.category].append(transaction.amount)
        
        category_anomalies = []
        for category, amounts in category_spending.items():
            if len(amounts) >= 3:
                cat_mean = statistics.mean(amounts)
                cat_std = statistics.stdev(amounts)
                
                for i, amount in enumerate(amounts):
                    if cat_std > 0:
                        z_score = abs(amount - cat_mean) / cat_std
                        if z_score > self.ANOMALY_THRESHOLD:
                            category_anomalies.append({
                                "category": category.value,
                                "amount": amount,
                                "z_score": round(z_score, 2),
                                "anomaly_type": f"unusual_{category.value}_spending"
                            })
        
        return {
            "total_anomalies": len(anomalies),
            "amount_anomalies": anomalies[:5],  # Top 5 anomalies
            "category_anomalies": category_anomalies[:3],  # Top 3 category anomalies
            "anomaly_threshold": self.ANOMALY_THRESHOLD
        }
    
    def _analyze_merchant_patterns(
        self, 
        transactions: List[Transaction]
    ) -> Dict[str, Any]:
        """Analyze spending patterns by merchant/description"""
        
        # Extract merchant patterns from descriptions
        merchant_spending = defaultdict(list)
        for transaction in transactions:
            # Simple merchant extraction (in real implementation, use more sophisticated NLP)
            merchant = transaction.description.split()[0] if transaction.description else "Unknown"
            merchant_spending[merchant].append(transaction.amount)
        
        merchant_analysis = {}
        for merchant, amounts in merchant_spending.items():
            if len(amounts) >= 2:  # Only analyze merchants with multiple transactions
                merchant_analysis[merchant] = {
                    "total_spent": round(sum(amounts), 2),
                    "transaction_count": len(amounts),
                    "average_transaction": round(statistics.mean(amounts), 2),
                    "frequency": "high" if len(amounts) >= self.HIGH_FREQUENCY_THRESHOLD else "moderate"
                }
        
        # Find top merchants
        top_merchants = sorted(
            merchant_analysis.items(),
            key=lambda x: x[1]["total_spent"],
            reverse=True
        )[:5]
        
        return {
            "merchant_analysis": merchant_analysis,
            "top_merchants": [{"merchant": m[0], **m[1]} for m in top_merchants],
            "unique_merchants": len(merchant_spending),
            "repeat_merchants": len(merchant_analysis)
        }
    
    def _identify_optimization_opportunities(
        self, 
        transactions: List[Transaction], 
        user_profile: UserFinancialProfile
    ) -> List[Dict[str, Any]]:
        """Identify specific opportunities to optimize spending"""
        
        opportunities = []
        
        # Analyze category spending for optimization
        category_spending = defaultdict(list)
        for transaction in transactions:
            category_spending[transaction.category].append(transaction.amount)
        
        benchmarks = self.SPENDING_BENCHMARKS.get(user_profile.demographic, {})
        
        for category, amounts in category_spending.items():
            total_spent = sum(amounts)
            benchmark = benchmarks.get(category, {})
            
            if benchmark and total_spent > benchmark["high"]:
                potential_savings = total_spent - benchmark["high"]
                opportunities.append({
                    "category": category.value,
                    "opportunity_type": "reduce_category_spending",
                    "current_spending": round(total_spent, 2),
                    "recommended_spending": benchmark["high"],
                    "potential_monthly_savings": round(potential_savings, 2),
                    "difficulty": "moderate",
                    "strategies": self._get_category_optimization_strategies(category)
                })
        
        # Identify high-frequency low-value transactions
        small_frequent_transactions = [
            t for t in transactions 
            if t.amount < 20 and not t.is_recurring
        ]
        
        if len(small_frequent_transactions) > 20:  # More than 20 small transactions
            total_small_spending = sum(t.amount for t in small_frequent_transactions)
            opportunities.append({
                "category": "miscellaneous",
                "opportunity_type": "reduce_small_purchases",
                "current_spending": round(total_small_spending, 2),
                "transaction_count": len(small_frequent_transactions),
                "potential_monthly_savings": round(total_small_spending * 0.3, 2),  # 30% reduction
                "difficulty": "easy",
                "strategies": [
                    "Track small purchases more carefully",
                    "Use the 24-hour rule for non-essential items",
                    "Set a weekly limit for miscellaneous spending"
                ]
            })
        
        # Identify subscription optimization
        recurring_transactions = [t for t in transactions if t.is_recurring]
        if recurring_transactions:
            total_subscriptions = sum(t.amount for t in recurring_transactions)
            opportunities.append({
                "category": "subscriptions",
                "opportunity_type": "optimize_subscriptions",
                "current_spending": round(total_subscriptions, 2),
                "subscription_count": len(recurring_transactions),
                "potential_monthly_savings": round(total_subscriptions * 0.2, 2),  # 20% reduction
                "difficulty": "easy",
                "strategies": [
                    "Review all subscriptions monthly",
                    "Cancel unused or duplicate services",
                    "Look for annual payment discounts",
                    "Share family plans where possible"
                ]
            })
        
        return sorted(opportunities, key=lambda x: x["potential_monthly_savings"], reverse=True)
    
    def _generate_behavioral_insights(
        self, 
        transactions: List[Transaction], 
        user_profile: UserFinancialProfile
    ) -> Dict[str, Any]:
        """Generate insights about spending behavior patterns"""
        
        insights = {}
        
        # Analyze spending timing
        hour_spending = defaultdict(float)
        for transaction in transactions:
            hour = transaction.date.hour
            hour_spending[hour] += transaction.amount
        
        if hour_spending:
            peak_spending_hour = max(hour_spending.keys(), key=lambda x: hour_spending[x])
            insights["peak_spending_time"] = f"{peak_spending_hour}:00"
            
            # Categorize spending times
            morning_spending = sum(hour_spending[h] for h in range(6, 12))
            afternoon_spending = sum(hour_spending[h] for h in range(12, 18))
            evening_spending = sum(hour_spending[h] for h in range(18, 24))
            night_spending = sum(hour_spending[h] for h in range(0, 6))
            
            insights["spending_by_time"] = {
                "morning": round(morning_spending, 2),
                "afternoon": round(afternoon_spending, 2),
                "evening": round(evening_spending, 2),
                "night": round(night_spending, 2)
            }
        
        # Analyze impulsive vs planned spending
        large_transactions = [t for t in transactions if t.amount > 100]
        small_transactions = [t for t in transactions if t.amount < 20]
        
        insights["spending_behavior"] = {
            "large_purchases": len(large_transactions),
            "small_frequent_purchases": len(small_transactions),
            "average_large_purchase": round(statistics.mean([t.amount for t in large_transactions]), 2) if large_transactions else 0,
            "spending_pattern": self._classify_spending_pattern(transactions)
        }
        
        # Demographic-specific behavioral insights
        if user_profile.demographic == DemographicType.STUDENT:
            insights["student_specific"] = self._analyze_student_spending_behavior(transactions)
        else:
            insights["professional_specific"] = self._analyze_professional_spending_behavior(transactions)
        
        return insights
    
    def _generate_spending_recommendations(
        self, 
        insights: Dict[str, Any], 
        user_profile: UserFinancialProfile
    ) -> List[str]:
        """Generate actionable spending recommendations based on insights"""
        
        recommendations = []
        
        # Recommendations based on spending patterns
        patterns = insights.get("spending_patterns", {})
        if patterns.get("highest_spending_day"):
            recommendations.append(
                f"You spend most on {patterns['highest_spending_day']}s. "
                f"Plan your weekly budget with this in mind."
            )
        
        # Category-based recommendations
        category_analysis = insights.get("category_analysis", {})
        top_categories = category_analysis.get("top_spending_categories", [])
        if top_categories:
            recommendations.append(
                f"Your top spending categories are {', '.join(top_categories[:2])}. "
                f"Focus optimization efforts here for maximum impact."
            )
        
        # Trend-based recommendations
        trends = insights.get("trend_analysis", {})
        if trends.get("trend_direction") == "increasing":
            recommendations.append(
                f"Your spending has increased by {trends.get('trend_change_percentage', 0):.1f}% recently. "
                f"Review your budget to ensure you're staying on track."
            )
        
        # Anomaly-based recommendations
        anomalies = insights.get("anomaly_detection", {})
        if anomalies.get("total_anomalies", 0) > 0:
            recommendations.append(
                f"You had {anomalies['total_anomalies']} unusual transactions. "
                f"Review these for potential errors or one-time expenses."
            )
        
        # Optimization opportunities
        opportunities = insights.get("optimization_opportunities", [])
        if opportunities:
            top_opportunity = opportunities[0]
            recommendations.append(
                f"Biggest savings opportunity: {top_opportunity['opportunity_type']} "
                f"could save you ${top_opportunity['potential_monthly_savings']:.0f}/month."
            )
        
        # Demographic-specific recommendations
        if user_profile.demographic == DemographicType.STUDENT:
            recommendations.extend([
                "Take advantage of student discounts and free campus resources",
                "Consider meal planning to reduce food costs",
                "Track small purchases - they add up quickly on a student budget"
            ])
        else:
            recommendations.extend([
                "Automate your savings to ensure consistent wealth building",
                "Review and optimize recurring subscriptions quarterly",
                "Consider tax-advantaged accounts for additional savings"
            ])
        
        return recommendations[:8]  # Limit to top 8 recommendations
    
    # Helper methods
    def _calculate_spending_consistency(self, daily_amounts: List[float]) -> str:
        """Calculate how consistent daily spending is"""
        if len(daily_amounts) < 2:
            return "insufficient_data"
        
        cv = statistics.stdev(daily_amounts) / statistics.mean(daily_amounts) if statistics.mean(daily_amounts) > 0 else 0
        
        if cv < 0.3:
            return "very_consistent"
        elif cv < 0.6:
            return "moderately_consistent"
        else:
            return "highly_variable"
    
    def _get_category_optimization_strategies(self, category: ExpenseCategory) -> List[str]:
        """Get optimization strategies for specific categories"""
        
        strategies = {
            ExpenseCategory.FOOD: [
                "Plan meals and create shopping lists",
                "Cook at home more often",
                "Use grocery store apps for deals and coupons",
                "Buy generic brands when possible"
            ],
            ExpenseCategory.ENTERTAINMENT: [
                "Look for free community events",
                "Use streaming services instead of movie theaters",
                "Take advantage of happy hour specials",
                "Host potluck dinners instead of dining out"
            ],
            ExpenseCategory.TRANSPORTATION: [
                "Use public transportation when possible",
                "Carpool or use ride-sharing",
                "Combine errands into single trips",
                "Consider biking or walking for short distances"
            ],
            ExpenseCategory.SHOPPING: [
                "Wait 24 hours before non-essential purchases",
                "Use cashback apps and browser extensions",
                "Shop sales and clearance sections",
                "Buy quality items that last longer"
            ]
        }
        
        return strategies.get(category, ["Review spending in this category for optimization opportunities"])
    
    def _classify_spending_pattern(self, transactions: List[Transaction]) -> str:
        """Classify overall spending pattern"""
        
        amounts = [t.amount for t in transactions]
        if not amounts:
            return "no_data"
        
        large_purchases = len([a for a in amounts if a > 100])
        small_purchases = len([a for a in amounts if a < 20])
        total_transactions = len(amounts)
        
        large_ratio = large_purchases / total_transactions
        small_ratio = small_purchases / total_transactions
        
        if large_ratio > 0.3:
            return "big_spender"
        elif small_ratio > 0.6:
            return "frequent_small_spender"
        else:
            return "balanced_spender"
    
    def _analyze_student_spending_behavior(self, transactions: List[Transaction]) -> Dict[str, Any]:
        """Analyze student-specific spending behavior"""
        
        # Analyze food spending patterns (common student concern)
        food_transactions = [t for t in transactions if t.category == ExpenseCategory.FOOD]
        dining_out = len([t for t in food_transactions if "restaurant" in t.description.lower() or "food" in t.description.lower()])
        
        # Analyze entertainment spending
        entertainment_transactions = [t for t in transactions if t.category == ExpenseCategory.ENTERTAINMENT]
        
        return {
            "food_spending_pattern": "dining_out_heavy" if dining_out > len(food_transactions) * 0.6 else "balanced",
            "entertainment_frequency": len(entertainment_transactions),
            "weekend_spending_ratio": self._calculate_weekend_spending_ratio(transactions),
            "textbook_spending": len([t for t in transactions if "book" in t.description.lower() or "textbook" in t.description.lower()])
        }
    
    def _analyze_professional_spending_behavior(self, transactions: List[Transaction]) -> Dict[str, Any]:
        """Analyze professional-specific spending behavior"""
        
        # Analyze work-related spending
        work_related = [t for t in transactions if any(keyword in t.description.lower() 
                      for keyword in ["coffee", "lunch", "uber", "gas", "parking"])]
        
        # Analyze subscription spending
        subscriptions = [t for t in transactions if t.is_recurring]
        
        return {
            "work_related_spending": round(sum(t.amount for t in work_related), 2),
            "subscription_spending": round(sum(t.amount for t in subscriptions), 2),
            "weekend_spending_ratio": self._calculate_weekend_spending_ratio(transactions),
            "investment_related": len([t for t in transactions if "investment" in t.description.lower() or "401k" in t.description.lower()])
        }
    
    def _calculate_weekend_spending_ratio(self, transactions: List[Transaction]) -> float:
        """Calculate ratio of weekend to weekday spending"""
        
        weekend_spending = sum(t.amount for t in transactions if t.date.weekday() >= 5)
        weekday_spending = sum(t.amount for t in transactions if t.date.weekday() < 5)
        
        total_spending = weekend_spending + weekday_spending
        return round(weekend_spending / total_spending, 2) if total_spending > 0 else 0

# Global spending insights engine instance
spending_engine = SpendingInsightsEngine()
