import { type NextRequest, NextResponse } from "next/server"

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>
  userProfile?: {
    demographic?: "student" | "professional" | null
    country?: string | null
    currency?: string | null
  }
}

const FINANCE_QA_DATABASE = [
  // Personal Finance Basics
  {
    question: "What is a budget?",
    answer:
      "A budget is a financial plan that outlines expected income and expenses over a specific period, helping you track spending and save money.",
    keywords: ["budget", "budgeting", "financial plan", "income", "expenses"],
  },
  {
    question: "What is the difference between gross income and net income?",
    answer:
      "Gross income is your total earnings before deductions; net income is what remains after taxes and other deductions.",
    keywords: ["gross income", "net income", "earnings", "deductions", "taxes"],
  },
  {
    question: "Why is an emergency fund important?",
    answer:
      "It provides financial security to cover unexpected expenses like medical bills or job loss, preventing debt reliance.",
    keywords: ["emergency fund", "financial security", "unexpected expenses", "medical bills", "job loss"],
  },
  {
    question: "How much should you ideally save from your income?",
    answer: "A common guideline is to save at least 20% of your monthly income.",
    keywords: ["save", "saving", "monthly income", "20%", "guideline"],
  },
  {
    question: "What is compound interest?",
    answer: "Interest calculated on both the initial principal and the accumulated interest from previous periods.",
    keywords: ["compound interest", "principal", "accumulated interest", "interest calculation"],
  },
  {
    question: "Why should you track your expenses?",
    answer: "Tracking expenses helps identify unnecessary spending and improve financial discipline.",
    keywords: ["track expenses", "unnecessary spending", "financial discipline", "expense tracking"],
  },
  {
    question: "What is a credit score?",
    answer: "A number representing your creditworthiness, based on credit history and repayment behavior.",
    keywords: ["credit score", "creditworthiness", "credit history", "repayment behavior"],
  },
  {
    question: "What is the 50/30/20 rule?",
    answer: "A budgeting rule: 50% for needs, 30% for wants, 20% for savings/investments.",
    keywords: ["50/30/20 rule", "budgeting rule", "needs", "wants", "savings", "investments"],
  },
  {
    question: "What is inflation?",
    answer: "The rate at which the general level of prices for goods and services rises, eroding purchasing power.",
    keywords: ["inflation", "prices", "goods", "services", "purchasing power"],
  },
  {
    question: "How does debt consolidation work?",
    answer: "Combining multiple debts into one loan with a lower interest rate to simplify repayment.",
    keywords: ["debt consolidation", "multiple debts", "lower interest rate", "simplify repayment"],
  },

  // Banking & Financial Services
  {
    question: "What is a savings account?",
    answer: "A bank account that earns interest on deposited funds while keeping them accessible.",
    keywords: ["savings account", "bank account", "interest", "deposited funds", "accessible"],
  },
  {
    question: "What is the difference between a debit card and a credit card?",
    answer:
      "A debit card withdraws money directly from your bank account; a credit card allows borrowing up to a set limit.",
    keywords: ["debit card", "credit card", "bank account", "borrowing", "set limit"],
  },
  {
    question: "What is an overdraft?",
    answer: "When you withdraw more money than your account balance, often incurring fees.",
    keywords: ["overdraft", "withdraw", "account balance", "fees"],
  },
  {
    question: "What is a fixed deposit (FD)?",
    answer: "A savings instrument where you deposit money for a fixed term at a fixed interest rate.",
    keywords: ["fixed deposit", "FD", "savings instrument", "fixed term", "fixed interest rate"],
  },
  {
    question: "What is mobile banking?",
    answer: "Banking services accessed through a mobile app or website.",
    keywords: ["mobile banking", "banking services", "mobile app", "website"],
  },
  {
    question: "What is KYC in banking?",
    answer: '"Know Your Customer" — a process to verify identity and prevent fraud.',
    keywords: ["KYC", "know your customer", "verify identity", "prevent fraud"],
  },
  {
    question: "What is a loan EMI?",
    answer: "Equated Monthly Installment — fixed monthly payment for loan repayment.",
    keywords: ["loan EMI", "equated monthly installment", "fixed monthly payment", "loan repayment"],
  },
  {
    question: "What is a mutual fund?",
    answer: "A pool of money collected from investors to invest in securities like stocks and bonds.",
    keywords: ["mutual fund", "pool of money", "investors", "securities", "stocks", "bonds"],
  },
  {
    question: "What is a recurring deposit (RD)?",
    answer: "A savings plan where you deposit a fixed amount monthly for a fixed term, earning interest.",
    keywords: ["recurring deposit", "RD", "savings plan", "fixed amount", "monthly", "fixed term"],
  },
  {
    question: "What is net banking?",
    answer: "Online access to banking services like fund transfers, bill payments, and account management.",
    keywords: ["net banking", "online access", "banking services", "fund transfers", "bill payments"],
  },

  // Investing & Markets
  {
    question: "What is a stock?",
    answer: "A share of ownership in a company.",
    keywords: ["stock", "share", "ownership", "company"],
  },
  {
    question: "What is a bond?",
    answer: "A debt security where you lend money to an entity in exchange for interest payments.",
    keywords: ["bond", "debt security", "lend money", "entity", "interest payments"],
  },
  {
    question: "What is diversification in investing?",
    answer: "Spreading investments across assets to reduce risk.",
    keywords: ["diversification", "investing", "spreading investments", "assets", "reduce risk"],
  },
  {
    question: "What is a stock index?",
    answer: "A measure of the performance of a group of stocks, e.g., Nifty 50, S&P 500.",
    keywords: ["stock index", "performance", "group of stocks", "Nifty 50", "S&P 500"],
  },
  {
    question: "What is the difference between a bull market and a bear market?",
    answer: "Bull market = rising prices; Bear market = falling prices.",
    keywords: ["bull market", "bear market", "rising prices", "falling prices"],
  },
  {
    question: "What is market capitalization?",
    answer: "Total market value of a company's shares (Share Price × Number of Shares).",
    keywords: ["market capitalization", "market value", "company shares", "share price"],
  },
  {
    question: "What is the P/E ratio?",
    answer: "Price-to-Earnings ratio — a valuation metric comparing stock price to earnings per share.",
    keywords: ["P/E ratio", "price-to-earnings", "valuation metric", "stock price", "earnings per share"],
  },
  {
    question: "What is dollar-cost averaging?",
    answer: "Investing a fixed amount regularly regardless of market conditions to reduce risk.",
    keywords: ["dollar-cost averaging", "fixed amount", "regularly", "market conditions", "reduce risk"],
  },
  {
    question: "What is an IPO?",
    answer: "Initial Public Offering — when a company sells shares to the public for the first time.",
    keywords: ["IPO", "initial public offering", "company", "sells shares", "public", "first time"],
  },
  {
    question: "What is cryptocurrency?",
    answer: "A digital currency using blockchain for secure, decentralized transactions.",
    keywords: ["cryptocurrency", "digital currency", "blockchain", "secure", "decentralized transactions"],
  },

  // Accounting & Corporate Finance
  {
    question: "What is an asset?",
    answer: "A resource owned by a company or person that has economic value.",
    keywords: ["asset", "resource", "owned", "company", "person", "economic value"],
  },
  {
    question: "What is a liability?",
    answer: "A financial obligation or debt.",
    keywords: ["liability", "financial obligation", "debt"],
  },
  {
    question: "What is equity?",
    answer: "Ownership value in a company after deducting liabilities from assets.",
    keywords: ["equity", "ownership value", "company", "deducting liabilities", "assets"],
  },
  {
    question: "What is depreciation?",
    answer: "Reduction in the value of an asset over time due to wear and tear.",
    keywords: ["depreciation", "reduction", "value", "asset", "time", "wear and tear"],
  },
  {
    question: "What is working capital?",
    answer: "Current assets minus current liabilities; measures liquidity.",
    keywords: ["working capital", "current assets", "current liabilities", "measures liquidity"],
  },
  {
    question: "What is ROI?",
    answer: "Return on Investment — profitability ratio calculated as (Net Profit ÷ Cost of Investment) × 100.",
    keywords: ["ROI", "return on investment", "profitability ratio", "net profit", "cost of investment"],
  },
  {
    question: "What is break-even point?",
    answer: "Sales level at which total revenue equals total costs.",
    keywords: ["break-even point", "sales level", "total revenue", "total costs"],
  },
  {
    question: "What is a balance sheet?",
    answer: "A financial statement showing assets, liabilities, and equity at a given date.",
    keywords: ["balance sheet", "financial statement", "assets", "liabilities", "equity", "given date"],
  },
  {
    question: "What is cash flow?",
    answer: "Movement of money in and out of a business.",
    keywords: ["cash flow", "movement of money", "business"],
  },
  {
    question: "What is leverage?",
    answer: "Using borrowed capital to increase investment potential.",
    keywords: ["leverage", "borrowed capital", "increase", "investment potential"],
  },

  // Recent Trends & Advanced Topics
  {
    question: "What is ESG investing?",
    answer: "Investing based on Environmental, Social, and Governance factors.",
    keywords: ["ESG investing", "environmental", "social", "governance factors"],
  },
  {
    question: "What is FinTech?",
    answer: "Technology-driven financial services like mobile payments, robo-advisors, and blockchain.",
    keywords: ["FinTech", "technology-driven", "financial services", "mobile payments", "robo-advisors", "blockchain"],
  },
  {
    question: "What is a robo-advisor?",
    answer: "Automated investment service using algorithms for portfolio management.",
    keywords: ["robo-advisor", "automated investment", "algorithms", "portfolio management"],
  },
  {
    question: "What is blockchain in finance?",
    answer: "A decentralized, secure ledger system for transactions.",
    keywords: ["blockchain", "finance", "decentralized", "secure ledger", "transactions"],
  },
  {
    question: "What is a SPAC?",
    answer: "Special Purpose Acquisition Company — created to raise money via IPO to acquire another company.",
    keywords: ["SPAC", "special purpose acquisition company", "raise money", "IPO", "acquire company"],
  },
  {
    question: "What is peer-to-peer lending?",
    answer: "Lending money directly to individuals via online platforms without a bank.",
    keywords: ["peer-to-peer lending", "lending money", "individuals", "online platforms", "without bank"],
  },
  {
    question: "What is microfinance?",
    answer: "Providing small loans to low-income individuals or groups lacking banking access.",
    keywords: ["microfinance", "small loans", "low-income", "individuals", "groups", "banking access"],
  },
  {
    question: "What is financial literacy?",
    answer: "Understanding how to manage money, including budgeting, investing, and credit use.",
    keywords: ["financial literacy", "manage money", "budgeting", "investing", "credit use"],
  },
  {
    question: "What is behavioral finance?",
    answer: "Study of how psychology affects financial decision-making.",
    keywords: ["behavioral finance", "psychology", "financial decision-making"],
  },
  {
    question: "What is a hedge fund?",
    answer: "A pooled investment fund that uses complex strategies to maximize returns.",
    keywords: ["hedge fund", "pooled investment", "complex strategies", "maximize returns"],
  },
]

function searchQADatabase(question: string): string | null {
  const lowerQuestion = question.toLowerCase().trim()

  // First, try exact question match
  for (const qa of FINANCE_QA_DATABASE) {
    if (qa.question.toLowerCase() === lowerQuestion) {
      return `## ${qa.question}

${qa.answer}

*This answer is from our finance knowledge base. Do you have any follow-up questions?*`
    }
  }

  // Then try keyword matching with scoring
  let bestMatch = null
  let bestScore = 0

  for (const qa of FINANCE_QA_DATABASE) {
    let score = 0

    // Check if question contains keywords from the database entry
    for (const keyword of qa.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        score += keyword.length // Longer keywords get higher scores
      }
    }

    // Bonus points for question word matches
    const questionWords = qa.question.toLowerCase().split(" ")
    const userWords = lowerQuestion.split(" ")

    for (const word of questionWords) {
      if (userWords.includes(word) && word.length > 2) {
        score += 2
      }
    }

    if (score > bestScore && score >= 5) {
      // Minimum threshold for relevance
      bestScore = score
      bestMatch = qa
    }
  }

  if (bestMatch) {
    return `## ${bestMatch.question}

${bestMatch.answer}

*This answer is from our finance knowledge base. Do you have any follow-up questions?*`
  }

  return null
}

function getEnhancedFinancialAdvice(question: string, userProfile?: any): string {
  const lowerQuestion = question.toLowerCase()

  const questionTypes = {
    investment: [
      "invest",
      "investment",
      "portfolio",
      "stocks",
      "bonds",
      "mutual funds",
      "etf",
      "returns",
      "market",
      "trading",
    ],
    budgeting: ["budget", "expense", "spending", "save money", "track expenses", "monthly budget", "income", "bills"],
    savings: ["save", "saving", "emergency fund", "savings account", "deposit", "interest rate"],
    debt: ["debt", "loan", "credit card", "mortgage", "pay off", "interest", "consolidation", "refinance"],
    retirement: ["retirement", "pension", "401k", "ira", "retire", "social security"],
    insurance: ["insurance", "health insurance", "life insurance", "coverage", "premium", "deductible"],
    tax: ["tax", "taxes", "deduction", "filing", "refund", "irs", "tax planning"],
    credit: ["credit score", "credit report", "improve credit", "credit history", "fico"],
    business: ["business", "startup", "entrepreneur", "business loan", "llc", "incorporation"],
    education: ["education", "student loan", "college fund", "529 plan", "tuition"],
    real_estate: ["house", "home", "mortgage", "rent", "property", "real estate", "down payment"],
    career: ["salary", "raise", "job", "career", "income", "negotiation", "benefits"],
  }

  let bestMatch = "general"
  let maxMatches = 0

  for (const [type, keywords] of Object.entries(questionTypes)) {
    const matches = keywords.filter((keyword) => lowerQuestion.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = type
    }
  }

  const responses: Record<string, string> = {
    investment: `## Investment Strategy 📈

**Smart investment approach for your situation:**

### Foundation First
• **Build emergency fund** - 3-6 months expenses in high-yield savings
• **Pay off credit card debt** - Typically 18-25% interest rates
• **Understand your risk tolerance** - Conservative, moderate, or aggressive
• **Set clear timeline** - Short-term vs long-term goals

### Beginner-Friendly Investments
• **Index Funds** - Low fees (0.03-0.20%), instant diversification across hundreds of stocks
• **Target-Date Funds** - Automatic rebalancing based on your retirement date
• **Dollar-Cost Averaging** - Invest fixed amount regularly regardless of market conditions
• **Robo-Advisors** - Automated portfolio management (Betterment, Wealthfront)

### Advanced Strategies
• **Individual Stock Research** - Start with 5-10% of portfolio maximum
• **Sector-Specific ETFs** - Technology, healthcare, international exposure
• **REITs** - Real estate investment trusts for property exposure
• **Tax-Loss Harvesting** - Offset gains with strategic losses

### Key Investment Principles
• **Diversify across asset classes** - Don't put all eggs in one basket
• **Keep investment fees under 1%** - High fees eat into returns
• **Review and rebalance quarterly** - Maintain target allocation
• **Stay invested during volatility** - Time in market beats timing the market

**What's your investment timeline and risk comfort level?**`,

    budgeting: `## Budgeting Mastery 💰

**Proven budgeting system that actually works:**

### Income Tracking Foundation
• **Calculate net monthly income** - After taxes, insurance, 401k contributions
• **Include all income sources** - Salary, freelance, side hustles, bonuses
• **Account for irregular income** - Average last 6 months for consistency
• **Track seasonal variations** - Holiday bonuses, summer work, etc.

### The 50/30/20 Framework
• **50% Needs** - Rent/mortgage, utilities, groceries, minimum debt payments, insurance
• **30% Wants** - Dining out, entertainment, hobbies, subscriptions, shopping
• **20% Financial Goals** - Emergency fund, extra debt payments, investments, retirement

### Implementation Tools & Strategies
• **Budgeting Apps** - Mint (free), YNAB ($14/month), PocketGuard, or simple Excel spreadsheet
• **Bank Automation** - Separate checking accounts for different categories
• **Weekly Check-ins** - Review spending every Sunday, adjust as needed
• **Cash Envelope Method** - Use cash for overspending categories like dining out

### Common Budgeting Solutions
• **Track expenses first** - Monitor spending for 1 full month before creating budget
• **Build in "fun money"** - Avoid feeling restricted with reasonable entertainment budget
• **Plan for irregular expenses** - Car maintenance, gifts, annual subscriptions
• **Start with 80/20 rule** - If 50/30/20 feels overwhelming, try 80% spending, 20% saving

**What's your biggest budgeting challenge - tracking expenses or sticking to limits?**`,

    savings: `## Savings Acceleration Plan 🏦

**Build wealth systematically with proven strategies:**

### Emergency Fund Strategy
• **Step 1: Starter Fund** - Save $1,000 as quickly as possible for small emergencies
• **Step 2: Full Emergency Fund** - Build to 3-6 months of total expenses
• **Step 3: Location Matters** - High-yield savings account (currently 4-5% APY)
• **Step 4: Accessibility** - Keep separate from checking, but easily accessible

### Savings Account Optimization
• **High-Yield Savings** - Online banks offer 10x more interest than traditional banks
• **Money Market Accounts** - Higher rates with check-writing ability and debit cards
• **Certificates of Deposit (CDs)** - Lock in guaranteed rates for 6 months to 5 years
• **Treasury Bills** - Government-backed, currently offering competitive rates

### Savings Automation Systems
• **Pay Yourself First** - Automatic transfer on payday before any spending
• **Percentage-Based Saving** - Start with 10%, increase by 1% every 6 months
• **Windfall Strategy** - Save 50% of tax refunds, bonuses, gifts, raises
• **Round-Up Programs** - Apps like Acorns round purchases up and invest the difference

### Savings Goals Priority Order
1. **Emergency Fund** - 3-6 months expenses (highest priority)
2. **Retirement Matching** - Get full employer 401k match (free money)
3. **High-Interest Debt** - Pay off credit cards, personal loans
4. **Additional Goals** - House down payment, vacation, car replacement

**How much can you realistically save each month right now?**`,

    debt: `## Debt Elimination Strategy 📉

**Get debt-free faster with proven methods:**

### Complete Debt Inventory
• **List all debts** - Credit cards, student loans, car loans, personal loans
• **Key details for each** - Current balance, minimum payment, interest rate, due date
• **Calculate debt-to-income ratio** - Total monthly debt payments ÷ gross monthly income (should be under 36%)
• **Identify highest priority debts** - Highest interest rates and smallest balances

### Proven Payoff Strategies
• **Debt Avalanche Method** - Pay minimums + extra to highest interest rate (saves most money mathematically)
• **Debt Snowball Method** - Pay minimums + extra to smallest balance (builds psychological momentum)
• **Hybrid Approach** - Knock out small debts under $1,000 first, then switch to avalanche method
• **Balance Transfer Strategy** - Move high-interest debt to 0% intro APR cards (12-21 months)

### Debt Consolidation Options
• **Balance Transfer Credit Cards** - 0% intro APR for 12-21 months, typically 3-5% transfer fee
• **Personal Consolidation Loans** - Fixed rates 6-36%, predictable monthly payments
• **Home Equity Loans/HELOC** - Lower rates, tax-deductible interest, but home is collateral
• **401k Loans** - Borrow from yourself, but reduces retirement growth

### Debt Prevention Strategies
• **Build Emergency Fund** - Prevents new debt when unexpected expenses arise
• **Use Cash/Debit Only** - For discretionary spending categories like dining and entertainment
• **Negotiate with Creditors** - Call and ask for lower interest rates (success rate ~50%)
• **Credit Counseling** - Non-profit agencies can help create debt management plans

**What type of debt is causing you the most stress right now?**`,

    retirement: `## Retirement Planning Roadmap 🏖️

**Secure your financial independence with strategic planning:**

### The Power of Starting Early
• **Age 25: $100/month** → $349,000 at 65 (assuming 7% annual return)
• **Age 35: $300/month** → $367,000 at 65 (same return assumption)
• **Key insight** - Every year you delay costs thousands in compound growth
• **Rule of 72** - Money doubles every 10.3 years at 7% return

### Retirement Account Hierarchy (Priority Order)
1. **401(k) with Employer Match** - Contribute enough to get full match (typically 3-6% of salary)
2. **Roth IRA** - $6,500/year limit (2024), tax-free growth and withdrawals in retirement
3. **Traditional IRA** - Tax deduction now, taxed as ordinary income in retirement
4. **Additional 401(k) Contributions** - Up to $22,500/year total (2024), $30,000 if 50+

### Age-Based Investment Allocation
• **20s-30s** - 80-90% stocks, 10-20% bonds (aggressive growth phase)
• **40s-50s** - 70-80% stocks, 20-30% bonds (balanced growth and stability)
• **60s+** - 50-70% stocks, 30-50% bonds (capital preservation focus)
• **Target-Date Funds** - Automatically adjust allocation as you age

### Retirement Savings Milestones
• **Save 10-15% of gross income** - Including employer match
• **1x annual salary by age 30** - $50k salary = $50k saved
• **3x annual salary by age 40** - $75k salary = $225k saved
• **10x annual salary by age 67** - $100k salary = $1M saved

**Are you currently contributing to any retirement accounts?**`,

    real_estate: `## Real Estate Financial Planning 🏠

**Smart approach to homeownership and property investment:**

### Homeownership Readiness Checklist
• **Stable Income** - Same job/industry for 2+ years, predictable income
• **Emergency Fund** - 3-6 months expenses (separate from down payment)
• **Debt-to-Income Ratio** - Total monthly debts under 43% of gross income
• **Location Stability** - Plan to stay in area for 5+ years minimum
• **Down Payment Saved** - 3.5% to 20% depending on loan type

### Down Payment Strategies by Loan Type
• **Conventional Loans** - 20% down avoids PMI, better rates, more seller acceptance
• **FHA Loans** - 3.5% down for first-time buyers, PMI required but removable
• **VA Loans** - 0% down for veterans, no PMI, competitive rates
• **USDA Loans** - 0% down for rural areas, income limits apply
• **First-Time Buyer Programs** - State and local assistance, down payment grants

### Total Housing Cost Calculation (Should be under 28% of gross income)
• **Principal & Interest** - Monthly mortgage payment
• **Property Taxes** - Varies by location, typically 0.5-2% of home value annually
• **Homeowners Insurance** - $1,000-3,000+ annually depending on location and coverage
• **HOA Fees** - $50-500+ monthly for condos and planned communities
• **Maintenance & Repairs** - Budget 1-3% of home value annually

### Rent vs. Buy Analysis Factors
• **Break-even timeline** - Typically 3-7 years depending on market
• **Opportunity cost** - Could down payment earn more invested in stock market?
• **Lifestyle preferences** - Mobility, maintenance responsibility, customization
• **Market conditions** - Local price trends, interest rates, rental availability

**Are you looking to buy your first home or considering investment property?**`,

    general: `## Comprehensive Financial Guidance 💡

**Your personalized financial roadmap for success:**

### Financial Foundation (Priority 1)
• **Track all income and expenses** - Use apps like Mint, YNAB, or simple spreadsheet for 1 month
• **Create realistic monthly budget** - Start with 50/30/20 rule (needs/wants/savings)
• **Build starter emergency fund** - $1,000 as quickly as possible for small emergencies
• **Pay minimum on all debts** - Avoid late fees and credit score damage

### Wealth Building Phase (Priority 2)
• **Get full employer 401(k) match** - This is free money, typically 3-6% of salary
• **Pay off high-interest debt** - Credit cards, personal loans (anything over 7% interest)
• **Build full emergency fund** - 3-6 months of total expenses in high-yield savings
• **Start investing in index funds** - Low-cost, diversified funds for long-term growth

### Advanced Optimization (Priority 3)
• **Maximize retirement contributions** - 401(k), IRA limits based on income and age
• **Consider real estate investment** - Primary residence first, then rental properties
• **Tax optimization strategies** - HSAs, tax-loss harvesting, Roth conversions
• **Estate planning basics** - Will, beneficiaries, power of attorney documents

### Ongoing Financial Health Maintenance
• **Review budget monthly** - Track progress, adjust categories as needed
• **Rebalance investments quarterly** - Maintain target asset allocation
• **Increase savings rate with raises** - Save 50% of any income increases
• **Continue financial education** - Books, podcasts, courses to stay informed

**What's your most pressing financial goal right now?**`,
  }

  let personalizedResponse = responses[bestMatch] || responses.general

  if (userProfile?.demographic === "student") {
    personalizedResponse += `\n\n**Student-specific tip:** Focus on building good financial habits now, even with limited income. Consider part-time work, apply for scholarships, and avoid unnecessary student debt.`
  } else if (userProfile?.demographic === "professional") {
    personalizedResponse += `\n\n**Professional tip:** Take advantage of employer benefits like 401(k) matching, HSAs, and professional development funds. Consider tax-advantaged accounts to reduce your tax burden.`
  }

  if (userProfile?.country && userProfile.country !== "United States") {
    personalizedResponse += `\n\n**International note:** Some specific account types mentioned may not be available in ${userProfile.country}. Look for equivalent tax-advantaged accounts and investment options in your country.`
  }

  return personalizedResponse
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, userProfile } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    const latestMessage = messages[messages.length - 1]
    if (latestMessage.role !== "user") {
      return NextResponse.json({ error: "Latest message must be from user" }, { status: 400 })
    }

    const databaseAnswer = searchQADatabase(latestMessage.content)

    let responseContent: string
    if (databaseAnswer) {
      responseContent = databaseAnswer
    } else {
      responseContent = getEnhancedFinancialAdvice(latestMessage.content, userProfile)
    }

    return NextResponse.json({
      content: responseContent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        content: `I apologize for the technical issue. Let me help with some general financial guidance:

## Quick Financial Wins 🎯

1. **Immediate actions:**
   • Track your spending for one week
   • Set up automatic savings transfer
   • Check your credit score (free at Credit Karma)

2. **This month:**
   • Create a basic budget
   • Research high-yield savings accounts
   • Review your insurance coverage

3. **Long-term:**
   • Start investing in index funds
   • Plan for retirement
   • Build multiple income streams

**What specific financial question can I help you with?**`,
      },
      { status: 200 },
    )
  }
}
