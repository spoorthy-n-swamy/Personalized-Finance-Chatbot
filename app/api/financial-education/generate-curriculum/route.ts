import { type NextRequest, NextResponse } from "next/server"

interface Course {
  id: string
  title: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  progress: number
  completed: boolean
  lessons: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userProfile, learningGoals, currentLevel, interests } = body

    // Generate personalized courses based on user input
    const personalizedCourses: Course[] = generateCoursesBasedOnInput(
      learningGoals,
      currentLevel,
      interests,
      userProfile,
    )

    return NextResponse.json({ courses: personalizedCourses })
  } catch (error) {
    console.error("Error generating curriculum:", error)
    return NextResponse.json({ error: "Failed to generate curriculum", courses: [] }, { status: 500 })
  }
}

function generateCoursesBasedOnInput(goals: string, level: string, interests: string, userProfile: any): Course[] {
  const allCourses: Course[] = [
    {
      id: "budgeting-basics",
      title: "Personal Budgeting Mastery",
      description: "Learn to create and maintain effective budgets that work for your lifestyle",
      level: "Beginner",
      duration: "2 weeks",
      progress: 0,
      completed: false,
      lessons: 8,
    },
    {
      id: "investing-fundamentals",
      title: "Investment Fundamentals",
      description: "Understanding stocks, bonds, and building your first investment portfolio",
      level: "Beginner",
      duration: "3 weeks",
      progress: 0,
      completed: false,
      lessons: 12,
    },
    {
      id: "advanced-investing",
      title: "Advanced Investment Strategies",
      description: "Options trading, portfolio optimization, and risk management techniques",
      level: "Advanced",
      duration: "4 weeks",
      progress: 0,
      completed: false,
      lessons: 16,
    },
    {
      id: "retirement-planning",
      title: "Retirement Planning Essentials",
      description: "401(k), IRA, and long-term wealth building strategies",
      level: "Intermediate",
      duration: "3 weeks",
      progress: 0,
      completed: false,
      lessons: 10,
    },
    {
      id: "tax-optimization",
      title: "Tax Planning & Optimization",
      description: "Minimize your tax burden with smart planning strategies",
      level: "Intermediate",
      duration: "2 weeks",
      progress: 0,
      completed: false,
      lessons: 8,
    },
    {
      id: "real-estate-investing",
      title: "Real Estate Investment Guide",
      description: "REITs, rental properties, and real estate market analysis",
      level: "Intermediate",
      duration: "4 weeks",
      progress: 0,
      completed: false,
      lessons: 14,
    },
    {
      id: "cryptocurrency-basics",
      title: "Cryptocurrency & Digital Assets",
      description: "Understanding Bitcoin, Ethereum, and blockchain technology",
      level: "Beginner",
      duration: "2 weeks",
      progress: 0,
      completed: false,
      lessons: 9,
    },
    {
      id: "debt-management",
      title: "Debt Management & Credit Repair",
      description: "Strategies to pay off debt and improve your credit score",
      level: "Beginner",
      duration: "3 weeks",
      progress: 0,
      completed: false,
      lessons: 11,
    },
    {
      id: "emergency-fund",
      title: "Building Your Emergency Fund",
      description: "Create a financial safety net for unexpected expenses",
      level: "Beginner",
      duration: "1 week",
      progress: 0,
      completed: false,
      lessons: 5,
    },
    {
      id: "financial-psychology",
      title: "Psychology of Money",
      description: "Understanding your money mindset and behavioral finance",
      level: "Intermediate",
      duration: "2 weeks",
      progress: 0,
      completed: false,
      lessons: 7,
    },
  ]

  // Filter courses based on user input
  let recommendedCourses = allCourses.filter((course) => {
    // Filter by level
    const levelMatch =
      level === "beginner"
        ? course.level === "Beginner"
        : level === "intermediate"
          ? ["Beginner", "Intermediate"].includes(course.level)
          : true // Advanced users get all courses

    // Filter by interests and goals
    const interestKeywords = interests.toLowerCase().split(/[,\s]+/)
    const goalKeywords = goals.toLowerCase().split(/[,\s]+/)
    const allKeywords = [...interestKeywords, ...goalKeywords]

    const contentMatch = allKeywords.some(
      (keyword) =>
        course.title.toLowerCase().includes(keyword) ||
        course.description.toLowerCase().includes(keyword) ||
        keyword.includes(course.title.toLowerCase().split(" ")[0]),
    )

    return levelMatch && (contentMatch || allKeywords.length === 0)
  })

  // If no matches, provide default beginner courses
  if (recommendedCourses.length === 0) {
    recommendedCourses = allCourses.filter((course) => course.level === "Beginner").slice(0, 4)
  }

  // Limit to 6 courses maximum
  return recommendedCourses.slice(0, 6)
}
