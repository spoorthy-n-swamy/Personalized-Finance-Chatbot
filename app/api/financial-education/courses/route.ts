export async function GET() {
  try {
    const courses = [
      {
        id: 1,
        title: "Personal Budgeting Fundamentals",
        description: "Learn the basics of creating and maintaining a personal budget",
        duration: "2 hours",
        difficulty: "Beginner",
        category: "Budgeting",
        modules: [
          { id: 1, title: "Understanding Income and Expenses", duration: "30 min", completed: false },
          { id: 2, title: "Creating Your First Budget", duration: "45 min", completed: false },
          { id: 3, title: "Tracking and Adjusting", duration: "45 min", completed: false },
        ],
        progress: 0,
      },
      {
        id: 2,
        title: "Investment Basics for Beginners",
        description: "Introduction to stocks, bonds, and mutual funds",
        duration: "3 hours",
        difficulty: "Beginner",
        category: "Investing",
        modules: [
          { id: 1, title: "Types of Investments", duration: "45 min", completed: false },
          { id: 2, title: "Risk and Return", duration: "45 min", completed: false },
          { id: 3, title: "Building a Portfolio", duration: "60 min", completed: false },
          { id: 4, title: "Getting Started", duration: "30 min", completed: false },
        ],
        progress: 0,
      },
      {
        id: 3,
        title: "Indian Tax Planning Strategies",
        description: "Maximize your tax savings with Section 80C, 80D, and more",
        duration: "2.5 hours",
        difficulty: "Intermediate",
        category: "Tax Planning",
        modules: [
          { id: 1, title: "Understanding Tax Slabs", duration: "30 min", completed: false },
          { id: 2, title: "Section 80C Deductions", duration: "45 min", completed: false },
          { id: 3, title: "Health Insurance Benefits", duration: "30 min", completed: false },
          { id: 4, title: "NPS and Long-term Savings", duration: "45 min", completed: false },
        ],
        progress: 0,
      },
      {
        id: 4,
        title: "Retirement Planning Essentials",
        description: "Plan for a secure financial future with retirement strategies",
        duration: "3.5 hours",
        difficulty: "Intermediate",
        category: "Retirement",
        modules: [
          { id: 1, title: "Retirement Goals Setting", duration: "45 min", completed: false },
          { id: 2, title: "EPF and PPF Benefits", duration: "60 min", completed: false },
          { id: 3, title: "Pension Plans Overview", duration: "60 min", completed: false },
          { id: 4, title: "Creating Your Plan", duration: "45 min", completed: false },
        ],
        progress: 0,
      },
      {
        id: 5,
        title: "Emergency Fund Building",
        description: "Create a financial safety net for unexpected expenses",
        duration: "1.5 hours",
        difficulty: "Beginner",
        category: "Savings",
        modules: [
          { id: 1, title: "Why Emergency Funds Matter", duration: "20 min", completed: false },
          { id: 2, title: "How Much to Save", duration: "30 min", completed: false },
          { id: 3, title: "Where to Keep Emergency Funds", duration: "40 min", completed: false },
        ],
        progress: 0,
      },
      {
        id: 6,
        title: "Credit Score Management",
        description: "Understand and improve your credit score for better financial opportunities",
        duration: "2 hours",
        difficulty: "Beginner",
        category: "Credit",
        modules: [
          { id: 1, title: "What is a Credit Score", duration: "30 min", completed: false },
          { id: 2, title: "Factors Affecting Credit Score", duration: "45 min", completed: false },
          { id: 3, title: "Improving Your Score", duration: "45 min", completed: false },
        ],
        progress: 0,
      },
    ]

    return Response.json({ courses })
  } catch (error) {
    console.error("Error loading courses:", error)
    return Response.json({ error: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userProfile } = body

    const courses = [
      {
        id: "1",
        title: "Personal Budgeting Fundamentals",
        description: "Learn the basics of creating and maintaining a personal budget",
        duration: "2 hours",
        level: "Beginner" as const,
        category: "Budgeting",
        lessons: 3,
        progress: 0,
        completed: false,
      },
      {
        id: "2",
        title: "Investment Basics for Beginners",
        description: "Introduction to stocks, bonds, and mutual funds",
        duration: "3 hours",
        level: "Beginner" as const,
        category: "Investing",
        lessons: 4,
        progress: 0,
        completed: false,
      },
      {
        id: "3",
        title: "Indian Tax Planning Strategies",
        description: "Maximize your tax savings with Section 80C, 80D, and more",
        duration: "2.5 hours",
        level: "Intermediate" as const,
        category: "Tax Planning",
        lessons: 4,
        progress: 0,
        completed: false,
      },
      {
        id: "4",
        title: "Retirement Planning Essentials",
        description: "Plan for a secure financial future with retirement strategies",
        duration: "3.5 hours",
        level: "Intermediate" as const,
        category: "Retirement",
        lessons: 4,
        progress: 0,
        completed: false,
      },
      {
        id: "5",
        title: "Emergency Fund Building",
        description: "Create a financial safety net for unexpected expenses",
        duration: "1.5 hours",
        level: "Beginner" as const,
        category: "Savings",
        lessons: 3,
        progress: 0,
        completed: false,
      },
      {
        id: "6",
        title: "Credit Score Management",
        description: "Understand and improve your credit score for better financial opportunities",
        duration: "2 hours",
        level: "Beginner" as const,
        category: "Credit",
        lessons: 3,
        progress: 0,
        completed: false,
      },
      {
        id: "7",
        title: "Advanced Portfolio Management",
        description: "Learn sophisticated investment strategies and portfolio optimization",
        duration: "4 hours",
        level: "Advanced" as const,
        category: "Investing",
        lessons: 5,
        progress: 0,
        completed: false,
      },
      {
        id: "8",
        title: "Real Estate Investment Guide",
        description: "Understand property investment, REITs, and real estate strategies",
        duration: "3 hours",
        level: "Intermediate" as const,
        category: "Real Estate",
        lessons: 4,
        progress: 0,
        completed: false,
      },
    ]

    return Response.json({ courses })
  } catch (error) {
    console.error("Error loading courses:", error)
    return Response.json({ error: "Failed to load courses" }, { status: 500 })
  }
}
