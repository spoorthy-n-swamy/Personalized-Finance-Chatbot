import google.generativeai as genai
from typing import Dict, Any, Optional
import json
from backend.config import settings

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def generate_financial_advice(self, query: str, user_context: Dict[str, Any]) -> str:
        """Generate personalized financial advice using Gemini"""
        try:
            # Build context-aware prompt
            context_prompt = self._build_context_prompt(user_context)
            full_prompt = f"{context_prompt}\n\nUser Question: {query}\n\nProvide detailed, actionable financial advice:"
            
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return "I'm having trouble accessing financial data right now. Please try again later."
    
    async def analyze_budget(self, income: float, expenses: Dict[str, float], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze budget and provide optimization suggestions"""
        try:
            prompt = f"""
            Analyze this budget for a {user_context.get('userType', 'user')} in {user_context.get('country', 'their location')}:
            
            Monthly Income: ${income:,.2f}
            Expenses: {json.dumps(expenses, indent=2)}
            
            Provide:
            1. Budget health score (1-10)
            2. Top 3 optimization suggestions
            3. Recommended savings allocation
            4. Emergency fund assessment
            5. Investment recommendations
            
            Format as JSON with keys: score, suggestions, savings_recommendation, emergency_fund, investments
            """
            
            response = self.model.generate_content(prompt)
            # Parse JSON response
            try:
                return json.loads(response.text)
            except:
                # Fallback if JSON parsing fails
                return {
                    "score": 7,
                    "suggestions": ["Track spending more carefully", "Reduce discretionary expenses", "Increase savings rate"],
                    "savings_recommendation": "Aim for 20% of income",
                    "emergency_fund": "Build 3-6 months of expenses",
                    "investments": "Consider low-cost index funds"
                }
        except Exception as e:
            print(f"Budget analysis error: {e}")
            return {"error": "Unable to analyze budget at this time"}
    
    async def generate_investment_insights(self, portfolio: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate investment insights and recommendations"""
        try:
            prompt = f"""
            Analyze this investment portfolio for a {user_context.get('userType', 'user')}:
            
            Portfolio: {json.dumps(portfolio, indent=2)}
            Age: {user_context.get('age', 'Not specified')}
            Risk Tolerance: {user_context.get('riskTolerance', 'Moderate')}
            
            Provide investment analysis with:
            1. Portfolio diversification score (1-10)
            2. Risk assessment
            3. Rebalancing recommendations
            4. Growth projections
            5. Tax optimization tips
            
            Format as JSON with keys: diversification_score, risk_level, rebalancing, projections, tax_tips
            """
            
            response = self.model.generate_content(prompt)
            try:
                return json.loads(response.text)
            except:
                return {
                    "diversification_score": 6,
                    "risk_level": "Moderate",
                    "rebalancing": "Consider increasing international exposure",
                    "projections": "7-9% annual growth expected",
                    "tax_tips": "Maximize tax-advantaged accounts"
                }
        except Exception as e:
            print(f"Investment analysis error: {e}")
            return {"error": "Unable to analyze investments"}
    
    async def calculate_retirement_plan(self, current_age: int, retirement_age: int, current_savings: float, monthly_contribution: float) -> Dict[str, Any]:
        """Calculate retirement projections"""
        try:
            prompt = f"""
            Calculate retirement planning for:
            - Current age: {current_age}
            - Retirement age: {retirement_age}
            - Current savings: ${current_savings:,.2f}
            - Monthly contribution: ${monthly_contribution:,.2f}
            
            Assume 7% annual return and provide:
            1. Projected retirement balance
            2. Monthly income in retirement (4% rule)
            3. Savings adequacy assessment
            4. Recommendations to improve
            
            Format as JSON with keys: projected_balance, monthly_income, adequacy, recommendations
            """
            
            response = self.model.generate_content(prompt)
            try:
                return json.loads(response.text)
            except:
                # Simple calculation fallback
                years_to_retirement = retirement_age - current_age
                future_value = current_savings * (1.07 ** years_to_retirement)
                monthly_contributions = monthly_contribution * 12 * years_to_retirement * 1.5  # Rough estimate
                total_balance = future_value + monthly_contributions
                
                return {
                    "projected_balance": total_balance,
                    "monthly_income": total_balance * 0.04 / 12,
                    "adequacy": "On track" if total_balance > 1000000 else "Needs improvement",
                    "recommendations": ["Increase monthly contributions", "Consider Roth IRA", "Diversify investments"]
                }
        except Exception as e:
            print(f"Retirement calculation error: {e}")
            return {"error": "Unable to calculate retirement projections"}
    
    def _build_context_prompt(self, user_context: Dict[str, Any]) -> str:
        """Build context-aware prompt based on user information"""
        context = f"""
        You are a professional financial advisor providing personalized advice.
        
        User Profile:
        - Type: {user_context.get('userType', 'General user')}
        - Country: {user_context.get('country', 'Not specified')}
        - Age: {user_context.get('age', 'Not specified')}
        - Income Level: {user_context.get('income', 'Not specified')}
        - Risk Tolerance: {user_context.get('riskTolerance', 'Moderate')}
        
        Provide advice that is:
        1. Specific to their profile and location
        2. Actionable and practical
        3. Appropriate for their experience level
        4. Compliant with general financial best practices
        """
        return context

# Global instance
gemini_service = GeminiService()
