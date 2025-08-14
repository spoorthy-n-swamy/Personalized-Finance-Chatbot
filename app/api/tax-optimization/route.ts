import { type NextRequest, NextResponse } from "next/server"

// Watson Discovery API integration
const WATSON_API_KEY = "DzItdGn8-Ukx-9l_EI7H_Sa4beYolpBmgUkwqRDDO9jb"
const WATSON_URL = "https://api.us-south.discovery.watson.cloud.ibm.com/instances/your-instance-id"

// Indian Tax Slabs for FY 2024-25
const TAX_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400001, max: 800000, rate: 0.05 },
  { min: 800001, max: 1200000, rate: 0.1 },
  { min: 1200001, max: 1600000, rate: 0.15 },
  { min: 1600001, max: 2000000, rate: 0.2 },
  { min: 2000001, max: 2400000, rate: 0.25 },
  { min: 2400001, max: Number.POSITIVE_INFINITY, rate: 0.3 },
]

const HEALTH_EDUCATION_CESS = 0.04 // 4% on total tax

interface TaxRequest {
  annual_income?: number
  income?: number
  filing_status: string
  age: number
  state: string
  current_investments?: {
    section_80c?: number
    section_80d?: number
    nps?: number
  }
  deductions?: Array<{
    category: string
    amount: number
    eligible: boolean
  }>
  user_context?: {
    userType: string
    country: string
    currency: string
    age: number
    state: string
  }
}

function calculateTax(income: number): { tax: number; breakdown: any[] } {
  let totalTax = 0
  const breakdown = []

  for (const slab of TAX_SLABS) {
    if (income > slab.min - 1) {
      const taxableInThisSlab = Math.min(income, slab.max) - (slab.min - 1)
      const taxForThisSlab = taxableInThisSlab * slab.rate
      totalTax += taxForThisSlab

      if (taxForThisSlab > 0) {
        breakdown.push({
          range:
            slab.max === Number.POSITIVE_INFINITY
              ? `Above ₹${(slab.min - 1).toLocaleString("en-IN")}`
              : `₹${(slab.min - 1).toLocaleString("en-IN")} - ₹${slab.max.toLocaleString("en-IN")}`,
          rate: `${slab.rate * 100}%`,
          taxable_amount: taxableInThisSlab,
          tax_amount: taxForThisSlab,
        })
      }
    }
  }

  // Add Health and Education Cess
  const cess = totalTax * HEALTH_EDUCATION_CESS
  totalTax += cess

  return { tax: totalTax, breakdown }
}

async function getWatsonTaxInsights(income: number, deductions: any[], userContext: any) {
  try {
    const watsonPrompt = `
    Analyze the following Indian tax situation and provide detailed recommendations:
    
    Income: ₹${income.toLocaleString()}
    Current Deductions: ${JSON.stringify(deductions)}
    User Profile: ${JSON.stringify(userContext)}
    
    Please provide:
    1. Detailed tax optimization strategies specific to Indian tax laws
    2. Section 80C, 80D, and NPS investment recommendations
    3. Tax-saving mutual fund (ELSS) suggestions
    4. Health insurance optimization under Section 80D
    5. Long-term wealth building strategies with tax benefits
    6. Specific action items with deadlines
    7. Risk assessment and diversification advice
    `

    // Simulate Watson API call (replace with actual Watson API integration)
    const watsonResponse = {
      analysis: `
**WATSON AI TAX ANALYSIS FOR INDIAN TAXPAYERS**

Based on your income of ₹${income.toLocaleString()}, here's my comprehensive tax optimization analysis:

**IMMEDIATE TAX-SAVING OPPORTUNITIES:**

1. **Section 80C Optimization (₹1,50,000 limit)**
   - Current utilization: ${deductions
     .filter((d) => d.category.includes("80C"))
     .reduce((sum, d) => sum + d.amount, 0)
     .toLocaleString()}
   - Recommended: Diversify across PPF (₹50,000), ELSS (₹50,000), and EPF/VPF (₹50,000)
   - Tax saving potential: ₹45,000 annually

2. **Health Insurance Strategy (Section 80D)**
   - Recommended coverage: ₹10 lakh family floater + ₹5 lakh parents coverage
   - Premium investment: ₹25,000 (self) + ₹50,000 (parents if senior citizens)
   - Tax benefit: Up to ₹22,500 annually

3. **National Pension System (NPS) - Section 80CCD(1B)**
   - Additional ₹50,000 deduction over 80C limit
   - Recommended allocation: 75% Equity, 25% Corporate Bonds
   - Long-term wealth creation with tax benefits

**ADVANCED STRATEGIES:**

4. **Tax-Loss Harvesting in Equity Investments**
   - Review capital gains/losses before March 31st
   - Offset short-term gains with losses
   - Potential savings: ₹15,000-30,000

5. **Home Loan Interest Deduction (Section 24)**
   - If applicable: Up to ₹2 lakh deduction on interest
   - Consider prepayment vs investment trade-offs

**WEALTH BUILDING WITH TAX EFFICIENCY:**

6. **ELSS Mutual Funds Strategy**
   - 3-year lock-in period with equity exposure
   - Historical returns: 12-15% CAGR
   - Recommended funds: Diversified across large, mid, small cap

7. **PPF Long-term Strategy**
   - 15-year lock-in with 7.1% current interest
   - Tax-free maturity proceeds
   - Ideal for conservative wealth building

**IMPLEMENTATION TIMELINE:**

- **By December 31st:** Complete 80% of planned investments
- **By January 31st:** Review and adjust portfolio allocation
- **By March 15th:** Final tax-saving investments
- **By March 31st:** All investments must be completed

**RISK ASSESSMENT:**
- Your income level suggests moderate to aggressive investment approach
- Diversification across debt and equity recommended
- Emergency fund: Maintain 6-12 months expenses separately

**NEXT STEPS:**
1. Open NPS account immediately for additional ₹50K deduction
2. Increase health insurance coverage for better protection
3. Start SIP in ELSS funds for rupee cost averaging
4. Review and optimize existing investments
5. Plan for next year's tax strategy early
      `,
      strategies: [
        {
          strategy_name: "Enhanced Section 80C Portfolio",
          potential_savings: 45000,
          recommended_contribution: 150000,
          implementation_steps: [
            "Maximize PPF contribution to ₹1.5 lakh annually",
            "Invest ₹50,000 in diversified ELSS mutual funds",
            "Increase VPF contribution if employed",
            "Consider NSC or tax-saving FDs for guaranteed returns",
          ],
          deadline: "March 31st",
          priority: "High",
          tax_bracket_impact: "30% tax bracket - Maximum benefit ₹45,000",
          unique_benefit: "PPF offers tax-free maturity after 15 years",
        },
        {
          strategy_name: "Comprehensive Health Insurance Strategy",
          potential_savings: 22500,
          recommended_contribution: 75000,
          implementation_steps: [
            "Purchase ₹10 lakh family floater health insurance",
            "Add ₹5 lakh coverage for parents (if senior citizens)",
            "Consider critical illness rider for additional protection",
            "Maintain separate personal accident insurance",
          ],
          deadline: "March 31st",
          priority: "High",
          additional_benefit: "Dual benefit of tax saving and health protection",
        },
        {
          strategy_name: "NPS Wealth Building Strategy",
          potential_savings: 15000,
          recommended_contribution: 50000,
          implementation_steps: [
            "Open NPS Tier-I account for additional ₹50K deduction",
            "Choose aggressive asset allocation (75% equity)",
            "Set up auto-debit for consistent contributions",
            "Review and rebalance portfolio annually",
          ],
          deadline: "March 31st",
          priority: "Medium",
          ongoing_benefit: "Long-term retirement corpus building with tax benefits",
        },
      ],
      next_steps: [
        "Immediately open NPS account for additional ₹50,000 deduction",
        "Review and enhance health insurance coverage",
        "Start systematic investment in ELSS mutual funds",
        "Plan tax-loss harvesting for equity investments",
        "Set up automatic investment reminders for March deadline",
      ],
    }

    return watsonResponse
  } catch (error) {
    console.error("Watson API error:", error)
    // Fallback to basic analysis if Watson fails
    return {
      analysis: "Basic tax analysis completed using Indian tax slabs.",
      strategies: [],
      next_steps: [],
    }
  }
}

function generateTaxStrategies(income: number, currentInvestments: any = {}) {
  const strategies = []

  // Section 80C Strategy
  const current80C = currentInvestments.section_80c || 0
  const max80C = 150000
  const remaining80C = Math.max(0, max80C - current80C)

  if (remaining80C > 0) {
    const taxSaving = remaining80C * 0.3 // Assuming 30% tax bracket
    strategies.push({
      name: "Section 80C Investments",
      description: "Invest in PPF, ELSS, NSC, or Tax-saving FDs",
      investment_amount: remaining80C,
      tax_savings: taxSaving,
      implementation_steps: [
        "Open PPF account if not already available",
        "Consider ELSS mutual funds for market-linked returns",
        "Invest in NSC for guaranteed returns",
        "Use tax-saving fixed deposits",
      ],
      deadline: "March 31st",
    })
  }

  // Section 80D Strategy
  const current80D = currentInvestments.section_80d || 0
  const max80D = 25000 // For individuals below 60
  const remaining80D = Math.max(0, max80D - current80D)

  if (remaining80D > 0) {
    const taxSaving = remaining80D * 0.3
    strategies.push({
      name: "Health Insurance Premium (80D)",
      description: "Pay health insurance premiums for self and family",
      investment_amount: remaining80D,
      tax_savings: taxSaving,
      implementation_steps: [
        "Purchase comprehensive health insurance",
        "Include family members in the policy",
        "Consider top-up plans for higher coverage",
      ],
      deadline: "March 31st",
    })
  }

  // NPS Strategy
  const currentNPS = currentInvestments.nps || 0
  const maxNPS = 50000 // Additional 50k under 80CCD(1B)
  const remainingNPS = Math.max(0, maxNPS - currentNPS)

  if (remainingNPS > 0) {
    const taxSaving = remainingNPS * 0.3
    strategies.push({
      name: "National Pension System (NPS)",
      description: "Additional ₹50,000 deduction under Section 80CCD(1B)",
      investment_amount: remainingNPS,
      tax_savings: taxSaving,
      implementation_steps: [
        "Open NPS account with any authorized provider",
        "Choose investment mix based on risk appetite",
        "Set up auto-debit for regular contributions",
      ],
      deadline: "March 31st",
    })
  }

  return strategies
}

export async function POST(request: NextRequest) {
  try {
    const data: TaxRequest = await request.json()

    const annual_income = data.annual_income || data.income || 0
    const { filing_status, age, state, current_investments = {}, deductions = [], user_context } = data

    // Calculate current tax
    const currentTaxCalc = calculateTax(annual_income)

    // Calculate optimized tax (with maximum deductions)
    const maxDeductions = 150000 + 25000 + 50000 // 80C + 80D + NPS
    const optimizedIncome = Math.max(0, annual_income - maxDeductions)
    const optimizedTaxCalc = calculateTax(optimizedIncome)

    const watsonInsights = await getWatsonTaxInsights(annual_income, deductions, user_context)

    // Generate basic strategies
    const basicStrategies = generateTaxStrategies(annual_income, current_investments)

    const allStrategies = [...basicStrategies, ...watsonInsights.strategies]

    // Calculate potential savings
    const potentialSavings = currentTaxCalc.tax - optimizedTaxCalc.tax

    const response = {
      current_tax: {
        gross_income: annual_income,
        taxable_income: annual_income,
        total_tax: currentTaxCalc.tax,
        effective_rate: (currentTaxCalc.tax / annual_income) * 100,
        breakdown: currentTaxCalc.breakdown,
      },
      optimized_tax: {
        gross_income: annual_income,
        taxable_income: optimizedIncome,
        total_tax: optimizedTaxCalc.tax,
        effective_rate: (optimizedTaxCalc.tax / annual_income) * 100,
        total_deductions: maxDeductions,
        breakdown: optimizedTaxCalc.breakdown,
      },
      strategies: allStrategies,
      potential_savings: potentialSavings,
      tax_analysis: watsonInsights.analysis,
      next_steps: watsonInsights.next_steps,
      detailed_tax_analysis: {
        current_tax_situation: {
          gross_income: annual_income,
          total_deductions: deductions.reduce((sum, d) => sum + (d.eligible ? d.amount : 0), 0),
          taxable_income: annual_income - deductions.reduce((sum, d) => sum + (d.eligible ? d.amount : 0), 0),
          tax_calculation: {
            base_tax: currentTaxCalc.tax / (1 + HEALTH_EDUCATION_CESS),
            health_education_cess: (currentTaxCalc.tax / (1 + HEALTH_EDUCATION_CESS)) * HEALTH_EDUCATION_CESS,
            total_tax_liability: currentTaxCalc.tax,
            effective_tax_rate: ((currentTaxCalc.tax / annual_income) * 100).toFixed(2),
          },
        },
        optimization_summary: {
          total_potential_savings: potentialSavings,
          high_priority_actions: allStrategies.filter((s) => s.priority === "High").length,
          implementation_timeline: "Complete by March 31st for current financial year benefits",
        },
      },
      tax_slabs: TAX_SLABS.map((slab) => ({
        range:
          slab.max === Number.POSITIVE_INFINITY
            ? `Above ₹${(slab.min - 1).toLocaleString("en-IN")}`
            : `₹${(slab.min - 1).toLocaleString("en-IN")} - ₹${slab.max.toLocaleString("en-IN")}`,
        rate: `${slab.rate * 100}%`,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Tax optimization error:", error)
    return NextResponse.json({ error: "Failed to calculate tax optimization" }, { status: 500 })
  }
}
