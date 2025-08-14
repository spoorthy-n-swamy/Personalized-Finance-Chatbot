from typing import Dict, List, Optional, Tuple
import math
from datetime import datetime, timedelta
from ..models.financial_models import (
    UserFinancialProfile, DemographicType, FinancialGoal, 
    ExpenseCategory, BudgetCategory
)
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class FinancialGuidanceEngine:
    """
    Core engine for providing personalized financial guidance
    Delivers customized advice on savings, taxes, and investments
    """
    
    def __init__(self):
        # Financial constants and rules
        self.EMERGENCY_FUND_MONTHS = settings.EMERGENCY_FUND_MONTHS
        self.DEFAULT_SAVINGS_RATE = settings.DEFAULT_SAVINGS_RATE
        
        # Age-based investment allocation (stocks vs bonds)
        self.AGE_BASED_ALLOCATION = {
            "conservative": lambda age: max(20, 100 - age),  # % in stocks
            "moderate": lambda age: max(30, 110 - age),
            "aggressive": lambda age: max(40, 120 - age)
        }
        
        # Tax brackets (simplified 2024 federal rates)
        self.TAX_BRACKETS = [
            (11000, 0.10),
            (44725, 0.12),
            (95375, 0.22),
            (182050, 0.24),
            (231250, 0.32),
            (578125, 0.35),
            (float('inf'), 0.37)
        ]
    
    def generate_comprehensive_guidance(
        self, 
        user_profile: UserFinancialProfile,
        specific_query: Optional[str] = None
    ) -> Dict[str, any]:
        """Generate comprehensive financial guidance for a user"""
        
        guidance = {
            "user_id": user_profile.user_id,
            "demographic": user_profile.demographic,
            "generated_at": datetime.now(),
            "recommendations": {}
        }
        
        # Core financial recommendations
        guidance["recommendations"]["emergency_fund"] = self._calculate_emergency_fund(user_profile)
        guidance["recommendations"]["savings"] = self._generate_savings_advice(user_profile)
        guidance["recommendations"]["investments"] = self._generate_investment_advice(user_profile)
        guidance["recommendations"]["tax_optimization"] = self._generate_tax_advice(user_profile)
        guidance["recommendations"]["debt_management"] = self._generate_debt_advice(user_profile)
        
        # Demographic-specific guidance
        if user_profile.demographic == DemographicType.STUDENT:
            guidance["recommendations"]["student_specific"] = self._generate_student_advice(user_profile)
        else:
            guidance["recommendations"]["professional_specific"] = self._generate_professional_advice(user_profile)
        
        # Goal-specific recommendations
        if user_profile.financial_goals:
            guidance["recommendations"]["goal_specific"] = self._generate_goal_specific_advice(user_profile)
        
        return guidance
    
    def _calculate_emergency_fund(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Calculate emergency fund recommendations"""
        
        monthly_expenses = user_profile.monthly_income * 0.7  # Estimate 70% of income as expenses
        emergency_fund_target = monthly_expenses * self.EMERGENCY_FUND_MONTHS
        
        # Adjust for demographic
        if user_profile.demographic == DemographicType.STUDENT:
            # Students need smaller emergency funds but should start early
            emergency_fund_target = monthly_expenses * 3  # 3 months for students
            monthly_contribution = user_profile.monthly_income * 0.05  # 5% of income
        else:
            monthly_contribution = user_profile.monthly_income * 0.10  # 10% of income
        
        months_to_goal = emergency_fund_target / monthly_contribution if monthly_contribution > 0 else 0
        
        return {
            "target_amount": round(emergency_fund_target, 2),
            "monthly_contribution": round(monthly_contribution, 2),
            "months_to_goal": round(months_to_goal, 1),
            "priority": "high" if emergency_fund_target > 0 else "medium",
            "advice": self._get_emergency_fund_advice(user_profile, emergency_fund_target, monthly_contribution)
        }
    
    def _generate_savings_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate personalized savings recommendations"""
        
        recommended_savings_rate = self.DEFAULT_SAVINGS_RATE
        
        # Adjust savings rate based on demographic and age
        if user_profile.demographic == DemographicType.STUDENT:
            recommended_savings_rate = 0.15  # 15% for students
        elif user_profile.age and user_profile.age < 30:
            recommended_savings_rate = 0.25  # 25% for young professionals
        elif user_profile.age and user_profile.age > 50:
            recommended_savings_rate = 0.30  # 30% for pre-retirement
        
        monthly_savings = user_profile.monthly_income * recommended_savings_rate
        annual_savings = monthly_savings * 12
        
        # Calculate compound growth over time
        years_to_retirement = max(65 - (user_profile.age or 25), 10)
        future_value = self._calculate_compound_interest(annual_savings, 0.07, years_to_retirement)
        
        return {
            "recommended_rate": recommended_savings_rate,
            "monthly_amount": round(monthly_savings, 2),
            "annual_amount": round(annual_savings, 2),
            "projected_retirement_value": round(future_value, 2),
            "years_to_retirement": years_to_retirement,
            "strategies": self._get_savings_strategies(user_profile),
            "accounts": self._recommend_savings_accounts(user_profile)
        }
    
    def _generate_investment_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate personalized investment recommendations"""
        
        age = user_profile.age or 25
        risk_tolerance = user_profile.risk_tolerance
        
        # Calculate asset allocation
        stock_percentage = self.AGE_BASED_ALLOCATION[risk_tolerance](age)
        bond_percentage = 100 - stock_percentage
        
        # Investment recommendations based on demographic
        if user_profile.demographic == DemographicType.STUDENT:
            investment_amount = user_profile.monthly_income * 0.05  # 5% for students
            recommendations = self._get_student_investment_advice()
        else:
            investment_amount = user_profile.monthly_income * 0.15  # 15% for professionals
            recommendations = self._get_professional_investment_advice()
        
        return {
            "monthly_investment": round(investment_amount, 2),
            "asset_allocation": {
                "stocks": stock_percentage,
                "bonds": bond_percentage,
                "alternatives": 5 if user_profile.demographic == DemographicType.PROFESSIONAL else 0
            },
            "recommended_accounts": self._recommend_investment_accounts(user_profile),
            "investment_vehicles": recommendations,
            "risk_level": risk_tolerance,
            "rebalancing_frequency": "quarterly"
        }
    
    def _generate_tax_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate tax optimization strategies"""
        
        annual_income = user_profile.monthly_income * 12
        estimated_tax = self._calculate_federal_tax(annual_income)
        effective_tax_rate = estimated_tax / annual_income if annual_income > 0 else 0
        
        # Tax optimization strategies
        strategies = []
        potential_savings = 0
        
        # 401(k) contribution
        if user_profile.demographic == DemographicType.PROFESSIONAL:
            max_401k = 23000  # 2024 limit
            recommended_401k = min(annual_income * 0.15, max_401k)
            tax_savings_401k = recommended_401k * effective_tax_rate
            strategies.append({
                "strategy": "Maximize 401(k) contributions",
                "amount": recommended_401k,
                "tax_savings": tax_savings_401k,
                "description": "Reduce taxable income through pre-tax retirement contributions"
            })
            potential_savings += tax_savings_401k
        
        # IRA contribution
        ira_limit = 7000  # 2024 limit
        if annual_income < 138000:  # Phase-out limit for Roth IRA
            strategies.append({
                "strategy": "Roth IRA contribution",
                "amount": ira_limit,
                "tax_savings": 0,  # Roth is post-tax but tax-free growth
                "description": "Tax-free growth and withdrawals in retirement"
            })
        
        # HSA if applicable
        if user_profile.demographic == DemographicType.PROFESSIONAL:
            hsa_limit = 4300  # 2024 individual limit
            hsa_tax_savings = hsa_limit * effective_tax_rate
            strategies.append({
                "strategy": "Health Savings Account (HSA)",
                "amount": hsa_limit,
                "tax_savings": hsa_tax_savings,
                "description": "Triple tax advantage: deductible, tax-free growth, tax-free withdrawals for medical expenses"
            })
            potential_savings += hsa_tax_savings
        
        return {
            "current_tax_rate": round(effective_tax_rate * 100, 2),
            "estimated_annual_tax": round(estimated_tax, 2),
            "optimization_strategies": strategies,
            "potential_annual_savings": round(potential_savings, 2),
            "tax_planning_tips": self._get_tax_planning_tips(user_profile)
        }
    
    def _generate_debt_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate debt management recommendations"""
        
        # Debt management strategies based on demographic
        if user_profile.demographic == DemographicType.STUDENT:
            return {
                "priority": "student_loans",
                "strategy": "income_driven_repayment",
                "recommendations": [
                    "Apply for income-driven repayment plans",
                    "Pay more than minimum when possible",
                    "Consider loan forgiveness programs",
                    "Avoid private loan consolidation with federal loans"
                ],
                "debt_to_income_target": 0.10  # 10% of income for debt payments
            }
        else:
            return {
                "priority": "high_interest_debt",
                "strategy": "debt_avalanche",
                "recommendations": [
                    "Pay minimums on all debts, extra on highest interest rate",
                    "Consider debt consolidation for multiple high-interest debts",
                    "Build emergency fund alongside debt payoff",
                    "Avoid taking on new debt during payoff period"
                ],
                "debt_to_income_target": 0.20  # 20% of income for debt payments
            }
    
    def _generate_student_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate student-specific financial advice"""
        
        return {
            "budgeting": {
                "recommended_split": {
                    "needs": 50,  # Housing, food, transportation
                    "wants": 30,  # Entertainment, dining out
                    "savings": 20   # Emergency fund + investments
                },
                "student_discounts": [
                    "Use student discounts for software, streaming services",
                    "Take advantage of free campus resources",
                    "Consider used textbooks and rental options"
                ]
            },
            "income_building": [
                "Look for part-time jobs or internships in your field",
                "Consider freelancing or gig work for flexible income",
                "Apply for scholarships and grants regularly",
                "Build skills that increase earning potential"
            ],
            "credit_building": [
                "Consider a student credit card with no annual fee",
                "Keep credit utilization below 30%",
                "Pay full balance every month to avoid interest",
                "Monitor credit score regularly"
            ]
        }
    
    def _generate_professional_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate professional-specific financial advice"""
        
        return {
            "career_financial_planning": {
                "salary_negotiation": [
                    "Research market rates for your position",
                    "Negotiate total compensation, not just salary",
                    "Consider benefits value in compensation package"
                ],
                "professional_development": [
                    "Invest in skills that increase earning potential",
                    "Consider advanced degrees or certifications",
                    "Build professional network for opportunities"
                ]
            },
            "wealth_building": {
                "investment_priorities": [
                    "Max out employer 401(k) match first",
                    "Contribute to Roth IRA if eligible",
                    "Consider taxable investment accounts for additional savings",
                    "Explore real estate investment opportunities"
                ],
                "tax_strategies": [
                    "Maximize pre-tax retirement contributions",
                    "Use HSA as retirement account if healthy",
                    "Consider tax-loss harvesting in taxable accounts"
                ]
            }
        }
    
    def _generate_goal_specific_advice(self, user_profile: UserFinancialProfile) -> Dict[str, any]:
        """Generate advice specific to user's financial goals"""
        
        goal_advice = {}
        
        for goal in user_profile.financial_goals:
            if goal == FinancialGoal.EMERGENCY_FUND:
                goal_advice["emergency_fund"] = {
                    "timeline": "3-6 months",
                    "account_type": "high_yield_savings",
                    "monthly_target": user_profile.monthly_income * 0.10
                }
            elif goal == FinancialGoal.RETIREMENT:
                goal_advice["retirement"] = {
                    "timeline": f"{max(65 - (user_profile.age or 25), 10)} years",
                    "savings_rate": "15-20% of income",
                    "accounts": ["401(k)", "IRA", "Roth IRA"]
                }
            elif goal == FinancialGoal.HOME_PURCHASE:
                goal_advice["home_purchase"] = {
                    "down_payment_target": "10-20% of home price",
                    "timeline": "2-5 years typically",
                    "savings_strategy": "separate high-yield savings account"
                }
            elif goal == FinancialGoal.DEBT_PAYOFF:
                goal_advice["debt_payoff"] = {
                    "strategy": "debt avalanche (highest interest first)",
                    "timeline": "varies by amount and interest rates",
                    "extra_payment_target": "any extra income"
                }
        
        return goal_advice
    
    # Helper methods
    def _calculate_compound_interest(self, annual_contribution: float, rate: float, years: int) -> float:
        """Calculate future value with compound interest"""
        if rate == 0:
            return annual_contribution * years
        return annual_contribution * (((1 + rate) ** years - 1) / rate)
    
    def _calculate_federal_tax(self, income: float) -> float:
        """Calculate estimated federal income tax"""
        tax = 0
        remaining_income = income
        
        for bracket_limit, rate in self.TAX_BRACKETS:
            if remaining_income <= 0:
                break
            
            taxable_in_bracket = min(remaining_income, bracket_limit - sum(limit for limit, _ in self.TAX_BRACKETS[:self.TAX_BRACKETS.index((bracket_limit, rate))]))
            tax += taxable_in_bracket * rate
            remaining_income -= taxable_in_bracket
        
        return tax
    
    def _get_emergency_fund_advice(self, user_profile: UserFinancialProfile, target: float, monthly: float) -> List[str]:
        """Get emergency fund specific advice"""
        advice = []
        
        if user_profile.demographic == DemographicType.STUDENT:
            advice.extend([
                f"Start with a smaller goal of ${target:,.0f} (3 months of expenses)",
                f"Save ${monthly:,.0f} per month to reach your goal",
                "Use a high-yield savings account for better returns",
                "Consider this your top financial priority"
            ])
        else:
            advice.extend([
                f"Build an emergency fund of ${target:,.0f} (6 months of expenses)",
                f"Automate ${monthly:,.0f} monthly transfers to savings",
                "Keep funds in easily accessible, FDIC-insured accounts",
                "Don't invest emergency funds - prioritize liquidity and safety"
            ])
        
        return advice
    
    def _get_savings_strategies(self, user_profile: UserFinancialProfile) -> List[str]:
        """Get demographic-specific savings strategies"""
        if user_profile.demographic == DemographicType.STUDENT:
            return [
                "Use the 'pay yourself first' principle",
                "Automate small, consistent transfers to savings",
                "Take advantage of student banking benefits",
                "Save windfalls like tax refunds or gifts"
            ]
        else:
            return [
                "Automate savings to make it effortless",
                "Increase savings rate with each raise",
                "Use tax-advantaged accounts when possible",
                "Review and optimize savings strategy annually"
            ]
    
    def _recommend_savings_accounts(self, user_profile: UserFinancialProfile) -> List[Dict[str, str]]:
        """Recommend appropriate savings accounts"""
        accounts = [
            {
                "type": "High-Yield Savings",
                "purpose": "Emergency fund and short-term goals",
                "features": "Higher interest rates, FDIC insured"
            }
        ]
        
        if user_profile.demographic == DemographicType.PROFESSIONAL:
            accounts.extend([
                {
                    "type": "Money Market Account",
                    "purpose": "Larger emergency funds",
                    "features": "Higher rates for larger balances, check writing"
                },
                {
                    "type": "CD (Certificate of Deposit)",
                    "purpose": "Medium-term goals (1-5 years)",
                    "features": "Fixed rates, penalty for early withdrawal"
                }
            ])
        
        return accounts
    
    def _get_student_investment_advice(self) -> List[Dict[str, str]]:
        """Get student-specific investment recommendations"""
        return [
            {
                "type": "Target-Date Fund",
                "description": "Automatically adjusts allocation as you age",
                "minimum": "Often $1,000 or less"
            },
            {
                "type": "Index Fund (S&P 500)",
                "description": "Low-cost, diversified stock market exposure",
                "minimum": "Varies by provider"
            },
            {
                "type": "Robo-Advisor",
                "description": "Automated investing with low minimums",
                "minimum": "Often $0-500"
            }
        ]
    
    def _get_professional_investment_advice(self) -> List[Dict[str, str]]:
        """Get professional-specific investment recommendations"""
        return [
            {
                "type": "401(k) with Employer Match",
                "description": "Free money from employer matching",
                "priority": "Highest - contribute enough to get full match"
            },
            {
                "type": "Roth IRA",
                "description": "Tax-free growth and withdrawals in retirement",
                "limit": "$7,000 annually (2024)"
            },
            {
                "type": "Taxable Investment Account",
                "description": "For goals beyond retirement",
                "flexibility": "No contribution limits or withdrawal restrictions"
            },
            {
                "type": "Real Estate Investment",
                "description": "REITs or direct property investment",
                "consideration": "For diversification and inflation protection"
            }
        ]
    
    def _recommend_investment_accounts(self, user_profile: UserFinancialProfile) -> List[str]:
        """Recommend investment account types"""
        if user_profile.demographic == DemographicType.STUDENT:
            return ["Roth IRA", "Taxable brokerage account"]
        else:
            return ["401(k)", "Roth IRA", "Traditional IRA", "Taxable brokerage account", "HSA"]
    
    def _get_tax_planning_tips(self, user_profile: UserFinancialProfile) -> List[str]:
        """Get tax planning tips"""
        tips = [
            "Keep detailed records of all tax-deductible expenses",
            "Consider timing of income and deductions",
            "Review tax strategy annually"
        ]
        
        if user_profile.demographic == DemographicType.STUDENT:
            tips.extend([
                "Claim education credits (American Opportunity Credit)",
                "Deduct student loan interest payments",
                "Keep track of education-related expenses"
            ])
        else:
            tips.extend([
                "Maximize retirement account contributions",
                "Consider tax-loss harvesting in investment accounts",
                "Explore HSA contributions for triple tax benefit"
            ])
        
        return tips

# Global financial guidance engine instance
financial_engine = FinancialGuidanceEngine()
