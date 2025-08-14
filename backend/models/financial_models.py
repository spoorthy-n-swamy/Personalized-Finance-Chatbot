from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

class DemographicType(str, Enum):
    STUDENT = "student"
    PROFESSIONAL = "professional"

class FinancialGoal(str, Enum):
    EMERGENCY_FUND = "emergency_fund"
    DEBT_PAYOFF = "debt_payoff"
    RETIREMENT = "retirement"
    HOME_PURCHASE = "home_purchase"
    INVESTMENT = "investment"
    EDUCATION = "education"

class ExpenseCategory(str, Enum):
    HOUSING = "housing"
    FOOD = "food"
    TRANSPORTATION = "transportation"
    UTILITIES = "utilities"
    HEALTHCARE = "healthcare"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    EDUCATION = "education"
    SAVINGS = "savings"
    OTHER = "other"

class Transaction(BaseModel):
    id: str
    amount: float
    category: ExpenseCategory
    description: str
    date: datetime
    is_recurring: bool = False

class BudgetCategory(BaseModel):
    category: ExpenseCategory
    budgeted_amount: float
    actual_amount: float = 0.0
    percentage_of_income: float = 0.0

class UserFinancialProfile(BaseModel):
    user_id: str
    demographic: DemographicType
    age: Optional[int] = None
    monthly_income: float
    financial_goals: List[FinancialGoal] = []
    risk_tolerance: str = "moderate"  # conservative, moderate, aggressive
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class BudgetSummary(BaseModel):
    user_id: str
    total_income: float
    total_expenses: float
    total_savings: float
    savings_rate: float
    categories: List[BudgetCategory]
    recommendations: List[str] = []
    generated_at: datetime = Field(default_factory=datetime.now)

class SpendingInsight(BaseModel):
    insight_type: str  # "trend", "anomaly", "recommendation"
    category: Optional[ExpenseCategory] = None
    message: str
    impact_score: float = Field(ge=0, le=10)  # 0-10 scale
    action_items: List[str] = []
