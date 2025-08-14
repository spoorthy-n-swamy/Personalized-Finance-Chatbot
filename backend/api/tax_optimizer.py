from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import os

router = APIRouter()

class TaxDeduction(BaseModel):
    category: str
    amount: float
    eligible: bool

class TaxOptimizationRequest(BaseModel):
    income: float
    filing_status: str
    deductions: List[TaxDeduction]
    user_context: Dict[str, Any]

def calculate_indian_tax(income: float) -> Dict[str, float]:
    """Calculate tax based on Indian tax slabs for FY 2024-25"""
    tax_slabs = [
        (400000, 0.0),      # Up to ₹4,00,000 - Nil
        (800000, 0.05),     # ₹4,00,001 – ₹8,00,000 - 5%
        (1200000, 0.10),    # ₹8,00,001 – ₹12,00,000 - 10%
        (1600000, 0.15),    # ₹12,00,001 – ₹16,00,000 - 15%
        (2000000, 0.20),    # ₹16,00,001 – ₹20,00,000 - 20%
        (2400000, 0.25),    # ₹20,00,001 – ₹24,00,000 - 25%
        (float('inf'), 0.30) # Above ₹24,00,000 - 30%
    ]
    
    total_tax = 0
    remaining_income = income
    previous_limit = 0
    
    for limit, rate in tax_slabs:
        if remaining_income <= 0:
            break
            
        taxable_in_slab = min(remaining_income, limit - previous_limit)
        tax_in_slab = taxable_in_slab * rate
        total_tax += tax_in_slab
        
        remaining_income -= taxable_in_slab
        previous_limit = limit
        
        if limit == float('inf'):
            break
    
    # Add 4% Health and Education Cess on total tax
    cess = total_tax * 0.04
    total_tax_with_cess = total_tax + cess
    
    return {
        "base_tax": total_tax,
        "cess": cess,
        "total_tax": total_tax_with_cess,
        "effective_rate": (total_tax_with_cess / income) * 100 if income > 0 else 0
    }

def get_standard_tax_strategies(income: float, deductions: List[TaxDeduction], user_context: Dict[str, Any]) -> List[Dict]:
    """Generate standard tax-saving strategies based on Indian tax laws"""
    strategies = []
    
    # Calculate current tax bracket
    if income > 2400000:
        tax_bracket = 0.30
    elif income > 2000000:
        tax_bracket = 0.25
    elif income > 1600000:
        tax_bracket = 0.20
    elif income > 1200000:
        tax_bracket = 0.15
    elif income > 800000:
        tax_bracket = 0.10
    elif income > 400000:
        tax_bracket = 0.05
    else:
        tax_bracket = 0.0
    
    if income > 300000:
        # Section 80C Strategy
        section_80c_limit = 150000
        current_80c = sum(d.amount for d in deductions if d.category in ["EPF", "PPF", "ELSS", "Life Insurance", "NSC"])
        remaining_80c = max(0, section_80c_limit - current_80c)
        
        if remaining_80c > 0:
            tax_savings = remaining_80c * tax_bracket * 1.04  # Including 4% cess
            
            strategies.append({
                "strategy_name": "Section 80C Tax Saving Investments",
                "potential_savings": round(tax_savings),
                "recommended_contribution": round(remaining_80c),
                "current_utilization": round(current_80c),
                "remaining_limit": round(remaining_80c),
                "implementation_steps": [
                    f"Invest remaining ₹{remaining_80c:,.0f} in 80C instruments",
                    "Consider PPF for 15-year lock-in with tax-free returns",
                    "ELSS mutual funds for 3-year lock-in with market returns",
                    "Increase EPF voluntary contribution",
                    "Consider NSC or tax-saving FDs"
                ],
                "deadline": "March 31, 2025",
                "priority": "high",
                "tax_bracket_impact": f"{tax_bracket*100:.0f}% tax savings + 4% cess"
            })
    
    # Section 80D Health Insurance Strategy
    age = user_context.get('age', 30)
    health_insurance_limit = 25000 if age < 60 else 50000
    parents_limit = 25000 if age < 60 else 50000
    current_health_premium = sum(d.amount for d in deductions if d.category == "Health Insurance")
    remaining_health = max(0, health_insurance_limit - current_health_premium)
    
    if remaining_health > 0:
        health_tax_savings = remaining_health * tax_bracket * 1.04
        
        strategies.append({
            "strategy_name": "Section 80D Health Insurance Optimization",
            "potential_savings": round(health_tax_savings),
            "recommended_contribution": round(remaining_health),
            "self_family_limit": health_insurance_limit,
            "parents_additional_limit": parents_limit,
            "implementation_steps": [
                f"Purchase health insurance worth ₹{remaining_health:,.0f}",
                "Consider family floater vs individual policies",
                "Add parents' premium for additional deduction",
                "Include preventive health check-up (₹5,000 additional)",
                "Choose policies with good claim settlement ratio"
            ],
            "deadline": "March 31, 2025",
            "priority": "high",
            "additional_benefit": "Health coverage + tax savings"
        })
    
    # NPS Strategy (80CCD-1B)
    if income > 500000:
        nps_additional_limit = 50000
        current_nps = sum(d.amount for d in deductions if d.category == "NPS")
        remaining_nps = max(0, nps_additional_limit - current_nps)
        
        if remaining_nps > 0:
            nps_tax_savings = remaining_nps * tax_bracket * 1.04
            
            strategies.append({
                "strategy_name": "NPS Additional Deduction (80CCD-1B)",
                "potential_savings": round(nps_tax_savings),
                "recommended_contribution": round(remaining_nps),
                "additional_to_80c": True,
                "implementation_steps": [
                    f"Contribute ₹{remaining_nps:,.0f} to NPS Tier-I account",
                    "This is over and above Section 80C limit",
                    "Choose appropriate asset allocation based on age",
                    "Consider auto-choice lifecycle fund",
                    "Remember 60% withdrawal is tax-free at maturity"
                ],
                "deadline": "March 31, 2025",
                "priority": "medium",
                "retirement_benefit": "Additional retirement corpus building"
            })
    
    # Home Loan Interest Strategy
    if any(d.category == "Home Loan Interest" for d in deductions):
        home_loan_interest = sum(d.amount for d in deductions if d.category == "Home Loan Interest")
        max_deduction = 200000  # For self-occupied property
        
        strategies.append({
            "strategy_name": "Home Loan Interest Optimization",
            "current_deduction": round(home_loan_interest),
            "maximum_allowed": max_deduction,
            "optimization_tip": "Consider prepayment timing",
            "implementation_steps": [
                "Ensure all interest payments are properly documented",
                "Consider timing of prepayments for tax efficiency",
                "Keep separate account for home loan transactions",
                "Claim principal repayment under Section 80C",
                "Consider let-out property for higher deduction limits"
            ],
            "deadline": "Ongoing throughout the year",
            "priority": "medium",
            "additional_info": "Principal repayment also eligible under 80C"
        })
    
    # ELSS Strategy
    if income > 600000:
        elss_recommendation = min(150000, income * 0.1)  # 10% of income or 80C limit
        current_elss = sum(d.amount for d in deductions if d.category == "ELSS")
        additional_elss = max(0, elss_recommendation - current_elss)
        
        if additional_elss > 0:
            elss_tax_savings = additional_elss * tax_bracket * 1.04
            
            strategies.append({
                "strategy_name": "ELSS Mutual Fund Investment",
                "potential_savings": round(elss_tax_savings),
                "recommended_contribution": round(additional_elss),
                "lock_in_period": "3 years (shortest among 80C options)",
                "implementation_steps": [
                    f"Invest ₹{additional_elss:,.0f} in ELSS mutual funds",
                    "Choose funds with good long-term track record",
                    "Consider SIP for rupee cost averaging",
                    "Diversify across 2-3 good ELSS funds",
                    "Review performance annually"
                ],
                "deadline": "March 31, 2025",
                "priority": "medium",
                "market_benefit": "Potential for higher returns than traditional 80C options"
            })
    
    return strategies

@router.post("/tax-optimization")
async def get_tax_optimization_strategies(request: TaxOptimizationRequest):
    """Get tax optimization strategies using Indian tax system and mathematical calculations"""
    try:
        total_deductions = sum(d.amount for d in request.deductions if d.eligible)
        standard_deduction = 50000  # Standard deduction under new tax regime
        
        # Calculate current tax liability
        current_tax = calculate_indian_tax(request.income)
        tax_after_deductions = calculate_indian_tax(max(0, request.income - total_deductions))
        
        # Generate standard tax strategies
        strategies = get_standard_tax_strategies(request.income, request.deductions, request.user_context)
        
        # Generate comprehensive tax analysis
        tax_analysis = f"""
INDIAN TAX ANALYSIS FOR FY 2024-25

CLIENT PROFILE:
- Annual Income: ₹{request.income:,.2f}
- Filing Status: {request.filing_status}
- Current Deductions: ₹{total_deductions:,.2f}
- Current Tax Liability: ₹{current_tax['total_tax']:,.2f}
- Effective Tax Rate: {current_tax['effective_rate']:.2f}%

TAX CALCULATION BREAKDOWN:
- Base Tax: ₹{current_tax['base_tax']:,.2f}
- Health & Education Cess (4%): ₹{current_tax['cess']:,.2f}
- Total Tax: ₹{current_tax['total_tax']:,.2f}

INDIAN TAX SLABS (FY 2024-25):
- Up to ₹4,00,000: Nil (0%)
- ₹4,00,001 – ₹8,00,000: 5%
- ₹8,00,001 – ₹12,00,000: 10%
- ₹12,00,001 – ₹16,00,000: 15%
- ₹16,00,001 – ₹20,00,000: 20%
- ₹20,00,001 – ₹24,00,000: 25%
- Above ₹24,00,000: 30%
Plus 4% Health and Education Cess on total tax

RECOMMENDED TAX-SAVING STRATEGIES:

1. SECTION 80C INVESTMENTS (₹1,50,000 limit):
   - Public Provident Fund (PPF): 15-year lock-in, tax-free returns
   - Equity Linked Savings Scheme (ELSS): 3-year lock-in, market-linked returns
   - Employee Provident Fund (EPF): Employer matching available
   - National Savings Certificate (NSC): 5-year lock-in, fixed returns
   - Life Insurance Premium: Term + investment plans

2. SECTION 80D HEALTH INSURANCE:
   - Self & Family: Up to ₹25,000 (₹50,000 if senior citizen)
   - Parents: Additional ₹25,000 (₹50,000 if senior citizen)
   - Preventive Health Check-up: Additional ₹5,000

3. SECTION 80CCD(1B) - NPS:
   - Additional deduction of ₹50,000 over Section 80C
   - Long-term retirement planning with tax benefits
   - 60% withdrawal tax-free at maturity

4. HOME LOAN BENEFITS:
   - Principal repayment: Under Section 80C (up to ₹1,50,000)
   - Interest payment: Under Section 24(b) (up to ₹2,00,000 for self-occupied)

5. OTHER DEDUCTIONS:
   - Section 80E: Education loan interest (no upper limit)
   - Section 80G: Donations to approved charities
   - Section 80TTA/80TTB: Interest on savings account

IMPLEMENTATION TIMELINE:
- All investments must be completed by March 31, 2025
- Keep proper documentation and receipts
- Consider systematic investment plans (SIPs) for regular investing
- Review and rebalance portfolio annually

TAX REGIME COMPARISON:
- Old Regime: Higher deductions available, suitable if total deductions > ₹2,50,000
- New Regime: Lower tax rates, simplified structure, limited deductions
- Choose based on your total eligible deductions and tax liability
        """
        
        return {
            "strategies": strategies,
            "tax_analysis": tax_analysis,
            "detailed_tax_analysis": {
                "current_tax_situation": {
                    "gross_income": round(request.income),
                    "total_deductions": round(total_deductions),
                    "taxable_income": round(max(0, request.income - total_deductions)),
                    "tax_calculation": {
                        "base_tax": round(current_tax["base_tax"]),
                        "health_education_cess": round(current_tax["cess"]),
                        "total_tax_liability": round(current_tax["total_tax"]),
                        "effective_tax_rate": round(current_tax["effective_rate"], 2)
                    },
                    "tax_regime_comparison": {
                        "old_regime_benefit": "Higher deductions available",
                        "new_regime_benefit": "Lower tax rates, simplified structure",
                        "recommendation": "Compare both regimes based on your deductions"
                    }
                },
                "optimization_summary": {
                    "total_potential_savings": round(sum(s.get("potential_savings", 0) for s in strategies)),
                    "high_priority_actions": len([s for s in strategies if s.get("priority") == "high"]),
                    "implementation_timeline": "Most investments must be completed by March 31, 2025"
                }
            },
            "next_steps": [
                "Compare old vs new tax regime for your situation",
                "Prioritize Section 80C and 80D investments",
                "Set up SIPs for systematic investment",
                "Keep all investment proofs and receipts organized",
                "Consider consulting a tax advisor for complex situations"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tax optimization failed: {str(e)}")

@router.post("/tax-document-checklist")
async def get_tax_document_checklist(request: TaxOptimizationRequest):
    """Get Indian tax document checklist"""
    try:
        # Indian tax documents
        documents = [
            {"category": "Income Documents", "documents": ["Form 16", "Form 16A (TDS certificates)", "Bank interest certificates", "Dividend statements", "Capital gains statements"]},
            {"category": "Investment Proofs", "documents": ["PPF statements", "ELSS certificates", "Life insurance premium receipts", "NSC certificates", "EPF annual statement"]},
            {"category": "Deduction Proofs", "documents": ["Health insurance premium receipts", "Home loan interest certificate", "Education loan interest certificate", "Donation receipts (80G)", "NPS statements"]},
            {"category": "Previous Year", "documents": ["Previous year ITR acknowledgment", "Form 26AS", "AIS (Annual Information Statement)"]}
        ]
        
        checklist_advice = f"""
INDIAN TAX DOCUMENT CHECKLIST FOR {request.user_context.get('userType', 'taxpayer').upper()}

INCOME: ₹{request.income:,.2f}
FILING STATUS: {request.filing_status}

MANDATORY DOCUMENTS:
✓ PAN Card
✓ Aadhaar Card
✓ Bank account details for refund
✓ Form 16 from employer
✓ Form 26AS (Tax Credit Statement)
✓ AIS (Annual Information Statement)

INVESTMENT PROOFS REQUIRED:
✓ PPF account statement
✓ ELSS mutual fund statements
✓ Life insurance premium receipts
✓ NSC certificates
✓ EPF annual statement
✓ NPS account statement

DEDUCTION PROOFS:
✓ Health insurance premium receipts
✓ Home loan interest certificate (Form 16A from bank)
✓ Education loan interest certificate
✓ Donation receipts with 80G registration
✓ Medical bills for senior citizens

IMPORTANT DEADLINES:
- ITR Filing: July 31, 2025
- Investment Deadline: March 31, 2025
- Advance Tax: June 15, Sep 15, Dec 15, Mar 15

Keep all documents organized and maintain both physical and digital copies.
        """
        
        return {
            "documents": documents,
            "personalized_advice": checklist_advice,
            "deadline_reminders": [
                "ITR filing due date: July 31, 2025",
                "Advance tax due dates: June 15, Sep 15, Dec 15, Mar 15",
                "Investment deadline: March 31, 2025"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tax checklist generation failed: {str(e)}")
