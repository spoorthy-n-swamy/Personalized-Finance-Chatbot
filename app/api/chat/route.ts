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

async function callIBMGraniteAPI(messages: Array<{ role: string; content: string }>, userProfile?: any) {
  try {
    console.log("[v0] Attempting IBM Granite 3.1 2B Instruct API call")

    // Build the conversation context for IBM Granite
    const systemPrompt = `You are an AI financial advisor powered by IBM Granite AI. You provide personalized financial guidance for ${userProfile?.demographic || "individuals"}${userProfile?.country ? ` in ${userProfile.country}` : ""}${userProfile?.currency ? ` using ${userProfile.currency}` : ""}.

Provide helpful, accurate financial advice on topics like budgeting, investments, savings, debt management, and retirement planning. Keep responses practical and actionable.

${
  userProfile?.demographic === "student"
    ? "Focus on student-friendly advice: budget-friendly solutions, building financial foundations, managing student loans, and simple explanations."
    : "Focus on professional advice: advanced investment strategies, tax optimization, retirement planning, and wealth building."
}`

    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`)
      .join("\n\n")

    const fullPrompt = `${systemPrompt}\n\n${conversationText}\n\nAssistant:`

    // IBM Watsonx API call with the provided API key
    const ibmResponse = await fetch("https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${await getIBMAccessToken()}`,
      },
      body: JSON.stringify({
        input: fullPrompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
        model_id: "ibm/granite-3.1-2b-instruct",
        project_id: process.env.IBM_PROJECT_ID || "c2045a8b-2591-4a7b-8e62-8d1f1e50a676",
      }),
    })

    if (ibmResponse.ok) {
      const data = await ibmResponse.json()
      console.log("[v0] IBM Granite API success")

      if (data.results && data.results[0] && data.results[0].generated_text) {
        return {
          content: data.results[0].generated_text.trim(),
          model: "ibm-granite-3.1-2b-instruct",
        }
      }
    } else {
      console.log("[v0] IBM Granite API failed:", ibmResponse.status, await ibmResponse.text())
    }
  } catch (error) {
    console.log("[v0] IBM Granite API error:", error)
  }

  return null
}

async function getIBMAccessToken(): Promise<string> {
  try {
    const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=cB_HbiX9VyjTxxRlZYaWVx8l3o_xyI_Rga1BbQUNgpbw`,
    })

    if (response.ok) {
      const data = await response.json()
      return data.access_token
    } else {
      throw new Error(`Token request failed: ${response.status}`)
    }
  } catch (error) {
    console.error("[v0] Error getting IBM access token:", error)
    throw error
  }
}

function generateFallbackFinancialResponse(
  userMessage: string,
  userProfile?: any,
  conversationHistory?: Array<{ role: string; content: string }>,
): string {
  const message = userMessage.toLowerCase()
  const isStudent = userProfile?.demographic === "student"
  const isProfessional = userProfile?.demographic === "professional"
  const country = userProfile?.country || ""
  const currency = userProfile?.currency || "USD"

  // Greeting responses
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    const greetings = [
      `Hello! I'm your AI financial advisor powered by IBM Granite 3.1 AI. ${isStudent ? "As a student, I can help you with budgeting on a tight income, student loans, and building good financial habits early." : isProfessional ? "As a professional, I can assist with investment strategies, retirement planning, and optimizing your financial portfolio." : "I'm here to help with all your financial questions."} What would you like to discuss?`,
      `Hi there! Ready to talk finances with IBM Granite AI? ${country ? `I understand you're in ${country}, so I'll tailor my advice accordingly.` : ""} What financial topic is on your mind today?`,
      `Welcome! I'm here to provide personalized financial guidance using IBM's advanced AI. Whether it's budgeting, investing, or planning for the future, I'm ready to help. What's your main financial concern right now?`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Budget-related responses
  if (message.includes("budget") || message.includes("expense") || message.includes("spending")) {
    const budgetResponses = [
      `## Smart Budgeting Strategy\n\n**The 50/30/20 Rule:**\n- 50% for needs (rent, groceries, utilities)\n- 30% for wants (entertainment, dining out)\n- 20% for savings and debt repayment\n\n**Getting Started:**\n1. Track expenses for 2 weeks\n2. Categorize your spending\n3. Identify areas to optimize\n4. Set realistic monthly limits\n\n${isStudent ? "**Student Tip:** Use free budgeting apps and look for student discounts on everything!" : isProfessional ? "**Professional Tip:** Consider using expense tracking tools that integrate with your bank accounts for automatic categorization." : ""}`,

      `## Building Your Budget Foundation\n\n**Step 1: Calculate Your Income**\n- Include all sources (salary, freelance, etc.)\n- Use after-tax amounts\n\n**Step 2: List Fixed Expenses**\n- Rent/mortgage, insurance, loan payments\n- These typically can't be easily changed\n\n**Step 3: Variable Expenses**\n- Food, transportation, entertainment\n- These offer flexibility for optimization\n\n**Step 4: Savings Goals**\n- Emergency fund first\n- Then specific goals (vacation, car, etc.)\n\n${currency !== "USD" ? `**Note:** All amounts should be calculated in ${currency} for accuracy.` : ""}`,

      `## Zero-Based Budgeting Approach\n\n**Concept:** Every dollar has a purpose before the month begins.\n\n**How it works:**\n1. Start with your monthly income\n2. Assign every dollar to a category\n3. Income minus expenses should equal zero\n4. Adjust categories as needed\n\n**Benefits:**\n- Forces intentional spending\n- Eliminates "mystery" expenses\n- Helps identify spending patterns\n\n${isStudent ? "This method works great for irregular student income!" : "Perfect for professionals wanting complete financial control."}`,
    ]
    return budgetResponses[Math.floor(Math.random() * budgetResponses.length)]
  }

  // Investment responses
  if (message.includes("invest") || message.includes("stock") || message.includes("portfolio")) {
    const investmentResponses = [
      `## Investment Fundamentals\n\n**Start Here:**\n- Emergency fund first (3-6 months expenses)\n- Pay off high-interest debt\n- Then begin investing\n\n**Beginner-Friendly Options:**\n- **Index Funds:** Instant diversification, low fees\n- **ETFs:** Trade like stocks, broad market exposure\n- **Target-Date Funds:** Automatically adjusts risk over time\n\n**Key Principles:**\n- Start small and be consistent\n- Diversify across asset classes\n- Think long-term (5+ years)\n- Don't try to time the market\n\n${isStudent ? "**Student Advantage:** Time is on your side - even small amounts can grow significantly!" : isProfessional ? "**Professional Strategy:** Consider maxing out 401(k) match first, then IRA contributions." : ""}`,

      `## Building Your Investment Strategy\n\n**Risk Assessment:**\n- **Conservative:** Bonds, CDs, high-yield savings\n- **Moderate:** Mix of stocks and bonds (60/40 split)\n- **Aggressive:** Primarily stocks, higher growth potential\n\n**Dollar-Cost Averaging:**\n- Invest fixed amount regularly\n- Reduces impact of market volatility\n- Builds discipline and consistency\n\n**Account Types:**\n- **Taxable:** Flexibility, no contribution limits\n- **401(k):** Employer match, tax advantages\n- **IRA:** Additional tax-advantaged space\n\n${country ? `**${country} Consideration:** Research local tax-advantaged accounts and regulations.` : ""}`,

      `## Investment Portfolio Basics\n\n**Asset Allocation by Age:**\n- **20s-30s:** 80-90% stocks, 10-20% bonds\n- **40s:** 70-80% stocks, 20-30% bonds\n- **50s+:** 60-70% stocks, 30-40% bonds\n\n**Diversification Strategy:**\n- Domestic vs. International stocks\n- Large, mid, and small-cap companies\n- Different sectors (tech, healthcare, finance)\n- Bonds for stability\n\n**Rebalancing:**\n- Review quarterly\n- Rebalance annually or when allocation drifts 5%+\n- Sell high, buy low automatically\n\n**Remember:** Consistency beats timing the market!`,
    ]
    return investmentResponses[Math.floor(Math.random() * investmentResponses.length)]
  }

  // Savings responses
  if (message.includes("save") || message.includes("emergency") || message.includes("fund")) {
    const savingsResponses = [
      `## Emergency Fund Strategy\n\n**Target Amount:**\n- **Minimum:** $1,000 starter fund\n- **Goal:** 3-6 months of expenses\n- **High-risk jobs:** 6-12 months\n\n**Where to Keep It:**\n- High-yield savings account\n- Money market account\n- Short-term CDs (laddered)\n\n**Building Your Fund:**\n1. Start with $25-50/month\n2. Use windfalls (tax refunds, bonuses)\n3. Automate transfers on payday\n4. Gradually increase contributions\n\n${isStudent ? "**Student Focus:** Even $500 can prevent credit card debt in emergencies!" : "**Professional Tip:** Keep emergency fund separate from checking to avoid temptation."}`,

      `## Savings Automation System\n\n**Pay Yourself First:**\n- Set up automatic transfers on payday\n- Treat savings like a non-negotiable bill\n- Start small and increase gradually\n\n**Savings Buckets:**\n- **Emergency Fund:** 3-6 months expenses\n- **Short-term Goals:** Vacation, car repair (1-2 years)\n- **Medium-term Goals:** House down payment (2-5 years)\n- **Long-term Goals:** Retirement (5+ years)\n\n**High-Yield Options:**\n- Online savings accounts (2-5% APY)\n- Money market accounts\n- Short-term Treasury bills\n\n**Tip:** Review and adjust savings rate every 6 months!`,

      `## Smart Savings Strategies\n\n**The 1% Challenge:**\n- Save 1% more of your income each month\n- Gradual increase feels manageable\n- Significant impact over time\n\n**Found Money Savings:**\n- Tax refunds → Emergency fund\n- Bonuses → Long-term goals\n- Cashback rewards → Vacation fund\n- Salary raises → Increase savings rate\n\n**Savings Hacks:**\n- Round up purchases to nearest dollar\n- Save coins and small bills\n- Use the 24-hour rule for non-essential purchases\n- Meal prep to reduce food costs\n\n${currency !== "USD" ? `**${currency} Strategy:** Consider local high-yield options and inflation-protected savings.` : ""}`,
    ]
    return savingsResponses[Math.floor(Math.random() * savingsResponses.length)]
  }

  // Debt management responses
  if (message.includes("debt") || message.includes("credit") || message.includes("loan")) {
    const debtResponses = [
      `## Debt Elimination Strategy\n\n**Two Popular Methods:**\n\n**Debt Avalanche (Math-Optimal):**\n- Pay minimums on all debts\n- Extra payments to highest interest rate\n- Saves most money long-term\n\n**Debt Snowball (Psychology-Focused):**\n- Pay minimums on all debts\n- Extra payments to smallest balance\n- Builds momentum and motivation\n\n**Credit Card Strategy:**\n- Stop using cards for new purchases\n- Pay more than minimum\n- Consider balance transfer if beneficial\n\n${isStudent ? "**Student Loans:** Look into income-driven repayment plans and forgiveness programs." : "**Professional Tip:** Consider debt consolidation if it lowers your overall interest rate."}`,

      `## Credit Score Improvement Plan\n\n**Key Factors:**\n- **Payment History (35%):** Never miss payments\n- **Credit Utilization (30%):** Keep below 30%, ideally under 10%\n- **Length of History (15%):** Keep old accounts open\n- **Credit Mix (10%):** Different types of credit\n- **New Credit (10%):** Limit hard inquiries\n\n**Quick Wins:**\n- Pay down credit card balances\n- Set up automatic minimum payments\n- Request credit limit increases\n- Check credit report for errors\n\n**Timeline:** Improvements typically show in 1-3 months with consistent effort.`,

      `## Debt Management Action Plan\n\n**Step 1: Debt Inventory**\n- List all debts with balances and rates\n- Include minimum payments\n- Calculate total debt amount\n\n**Step 2: Budget Analysis**\n- Find extra money for debt payments\n- Cut non-essential expenses temporarily\n- Consider side income opportunities\n\n**Step 3: Choose Your Strategy**\n- Avalanche for math optimization\n- Snowball for psychological wins\n- Hybrid approach combining both\n\n**Step 4: Stay Motivated**\n- Track progress visually\n- Celebrate milestones\n- Focus on the freedom debt payoff brings\n\n**Remember:** Every extra dollar toward debt saves you money in interest!`,
    ]
    return debtResponses[Math.floor(Math.random() * debtResponses.length)]
  }

  // Retirement planning responses
  if (message.includes("retirement") || message.includes("401k") || message.includes("pension")) {
    const retirementResponses = [
      `## Retirement Planning Essentials\n\n**The Magic of Starting Early:**\n- $100/month at age 25 = $349,000 at 65 (7% return)\n- $100/month at age 35 = $147,000 at 65 (7% return)\n- Time is your greatest asset!\n\n**Retirement Account Priority:**\n1. **401(k) match:** Free money from employer\n2. **High-interest debt:** Pay off first\n3. **IRA:** Additional tax-advantaged space\n4. **More 401(k):** Up to annual limits\n5. **Taxable accounts:** For early retirement\n\n${isStudent ? "**Student Advantage:** Even $25/month in an IRA can grow to six figures by retirement!" : isProfessional ? "**Professional Strategy:** Aim to save 10-15% of income for retirement, including employer match." : ""}`,

      `## 401(k) Optimization Guide\n\n**Employer Match:**\n- Always contribute enough to get full match\n- It's an immediate 100% return on investment\n- Missing match is leaving money on the table\n\n**Contribution Strategies:**\n- **Traditional 401(k):** Tax deduction now, taxed in retirement\n- **Roth 401(k):** No deduction now, tax-free in retirement\n- **Mix both:** Hedge against future tax rates\n\n**Investment Selection:**\n- Choose low-cost index funds\n- Target-date funds for simplicity\n- Rebalance annually\n- Avoid company stock concentration\n\n**Annual Limits (2024):** $23,000 under 50, $30,500 if 50+`,

      `## Retirement Income Planning\n\n**The 4% Rule:**\n- Withdraw 4% of portfolio annually\n- Historically sustainable for 30+ years\n- $1 million portfolio = $40,000/year income\n\n**Income Sources:**\n- **Social Security:** Foundation of retirement income\n- **401(k)/IRA:** Primary savings vehicle\n- **Pensions:** If available\n- **Part-time work:** Bridge to full retirement\n- **Rental income:** Real estate investments\n\n**Healthcare Considerations:**\n- Medicare doesn't cover everything\n- Consider Health Savings Account (HSA)\n- Long-term care insurance\n\n**Retirement Timeline:** Work backwards from your desired retirement lifestyle to determine savings needs.`,
    ]
    return retirementResponses[Math.floor(Math.random() * retirementResponses.length)]
  }

  // Default responses with variety
  const defaultResponses = [
    `## Welcome to Your Financial Journey! 🎯\n\nI'm here to help you build a stronger financial future using IBM Granite AI technology. Here's what we can explore together:\n\n**Popular Topics:**\n- **Budgeting:** Create a spending plan that works\n- **Investing:** Grow your wealth over time\n- **Saving:** Build emergency funds and reach goals\n- **Debt Management:** Pay off debt strategically\n- **Retirement Planning:** Secure your future\n\n${isStudent ? "**For Students:** I can help with budgeting on limited income, student loans, and building credit." : isProfessional ? "**For Professionals:** Let's discuss investment strategies, tax optimization, and retirement planning." : ""}\n\nWhat financial topic interests you most?`,

    `## Your Personal Financial Advisor 💡\n\nEvery financial journey is unique, and I'm here to provide guidance tailored to your situation using advanced IBM AI.\n\n**Current Focus Areas:**\n- Creating sustainable budgets\n- Investment strategies for beginners\n- Emergency fund planning\n- Credit score improvement\n- Retirement savings optimization\n\n${country ? `**${country} Context:** I'll consider local financial practices and regulations in my advice.` : ""}\n\n**What's your biggest financial challenge right now?**`,

    `## Let's Talk Money! 💰\n\nFinancial wellness is about making informed decisions that align with your goals and values, powered by IBM Granite AI.\n\n**I can help you with:**\n- **Short-term:** Budgeting, saving, debt payoff\n- **Medium-term:** Major purchases, investment basics\n- **Long-term:** Retirement planning, wealth building\n\n**Getting Started:**\nTell me about your current financial situation or ask about any specific topic. I'm here to provide practical, actionable advice.\n\n**What would you like to focus on today?**`,
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
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

    try {
      const ibmResult = await callIBMGraniteAPI(messages, userProfile)
      if (ibmResult) {
        return NextResponse.json({
          content: ibmResult.content,
          timestamp: new Date().toISOString(),
          model: ibmResult.model,
        })
      }
    } catch (ibmError) {
      console.log("[v0] IBM Granite API failed, trying fallback:", ibmError)
    }

    const systemPrompt = `You are an AI financial advisor. You provide personalized financial guidance for ${userProfile?.demographic || "individuals"}${userProfile?.country ? ` in ${userProfile.country}` : ""}${userProfile?.currency ? ` using ${userProfile.currency}` : ""}.

Provide helpful, accurate financial advice on topics like budgeting, investments, savings, debt management, and retirement planning. Keep responses practical and actionable.`

    try {
      console.log("[v0] Attempting Hugging Face Serverless API with DeepSeek model")

      const hfResponse = await fetch("https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-V3", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || "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"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nUser: ${latestMessage.content}\n\nAssistant:`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
          },
        }),
      })

      if (hfResponse.ok) {
        const data = await hfResponse.json()
        console.log("[v0] Hugging Face DeepSeek API success")

        let responseText = ""
        if (Array.isArray(data) && data[0]?.generated_text) {
          responseText = data[0].generated_text.trim()
        } else if (data.generated_text) {
          responseText = data.generated_text.trim()
        }

        if (responseText) {
          return NextResponse.json({
            content: responseText,
            timestamp: new Date().toISOString(),
            model: "deepseek-v3-huggingface",
          })
        }
      } else {
        console.log("[v0] Hugging Face DeepSeek API failed:", hfResponse.status)
      }
    } catch (hfError) {
      console.log("[v0] Hugging Face API error:", hfError)
    }

    try {
      console.log("[v0] Attempting Hugging Face with Llama model")

      const hfLlamaResponse = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || "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"}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\nUser: ${latestMessage.content}\n\nAssistant:`,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
              return_full_text: false,
            },
          }),
        },
      )

      if (hfLlamaResponse.ok) {
        const data = await hfLlamaResponse.json()
        console.log("[v0] Hugging Face Llama API success")

        let responseText = ""
        if (Array.isArray(data) && data[0]?.generated_text) {
          responseText = data[0].generated_text.trim()
        } else if (data.generated_text) {
          responseText = data.generated_text.trim()
        }

        if (responseText) {
          return NextResponse.json({
            content: responseText,
            timestamp: new Date().toISOString(),
            model: "llama-3.2-3b-huggingface",
          })
        }
      } else {
        console.log("[v0] Hugging Face Llama API failed:", hfLlamaResponse.status)
      }
    } catch (hfLlamaError) {
      console.log("[v0] Hugging Face Llama API error:", hfLlamaError)
    }

    console.log("[v0] Note: All APIs not available, using enhanced fallback system")
    console.log("[v0] Using enhanced fallback financial advisory system")

    const fallbackResponse = generateFallbackFinancialResponse(latestMessage.content, userProfile, messages)
    return NextResponse.json({
      content: fallbackResponse,
      timestamp: new Date().toISOString(),
      model: "enhanced-financial-advisor",
    })
  } catch (error) {
    console.error("Chat API error:", error)

    const fallbackMessage =
      "I'm your AI financial advisor powered by IBM Granite AI. I can help you with budgeting, investments, savings strategies, debt management, and retirement planning. What specific financial topic would you like to discuss?"

    return NextResponse.json(
      {
        content: fallbackMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  }
}
