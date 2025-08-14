"use client"

import { useState, useEffect } from "react"
import { HomeButton } from "@/components/home-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Bot,
  DollarSign,
  Coffee,
  Car,
  ShoppingCart,
  Globe,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface SpendingInsightsProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights" | "welcome") => void
}

// Mock spending trends data
const getSpendingTrends = (demographic: "student" | "professional" | null) => {
  if (demographic === "student") {
    return [
      { month: "Jan", total: 850, food: 180, housing: 380, transport: 90, entertainment: 120, education: 80 },
      { month: "Feb", total: 920, food: 200, housing: 400, transport: 95, entertainment: 140, education: 85 },
      { month: "Mar", total: 880, food: 190, housing: 400, transport: 85, entertainment: 125, education: 80 },
      { month: "Apr", total: 950, food: 200, housing: 400, transport: 100, entertainment: 150, education: 100 },
      { month: "May", total: 920, food: 195, housing: 400, transport: 95, entertainment: 130, education: 100 },
      { month: "Jun", total: 950, food: 200, housing: 400, transport: 100, entertainment: 100, education: 150 },
    ]
  } else {
    return [
      {
        month: "Jan",
        total: 3800,
        food: 550,
        housing: 1700,
        transport: 380,
        entertainment: 450,
        healthcare: 280,
        investments: 440,
      },
      {
        month: "Feb",
        total: 4100,
        food: 580,
        housing: 1800,
        transport: 400,
        entertainment: 500,
        healthcare: 300,
        investments: 520,
      },
      {
        month: "Mar",
        total: 3900,
        food: 560,
        housing: 1800,
        transport: 390,
        entertainment: 480,
        healthcare: 290,
        investments: 380,
      },
      {
        month: "Apr",
        total: 4200,
        food: 600,
        housing: 1800,
        transport: 400,
        entertainment: 500,
        healthcare: 300,
        investments: 600,
      },
      {
        month: "May",
        total: 4000,
        food: 580,
        housing: 1800,
        transport: 380,
        entertainment: 460,
        healthcare: 280,
        investments: 500,
      },
      {
        month: "Jun",
        total: 4200,
        food: 600,
        housing: 1800,
        transport: 400,
        entertainment: 500,
        healthcare: 300,
        investments: 600,
      },
    ]
  }
}

// Mock insights data
const getInsightsData = (demographic: "student" | "professional" | null) => {
  if (demographic === "student") {
    return {
      spendingScore: 85,
      trends: {
        increasing: ["Entertainment", "Education"],
        decreasing: ["Transportation"],
        stable: ["Housing", "Food"],
      },
      recommendations: [
        {
          category: "Food",
          type: "optimization",
          title: "Meal Prep Savings",
          description: "You could save $40/month by meal prepping 3 days a week instead of eating out",
          potential: 40,
          difficulty: "Easy",
        },
        {
          category: "Entertainment",
          type: "alert",
          title: "Entertainment Spending Up",
          description: "Your entertainment spending increased 25% this month. Consider free campus activities",
          potential: 30,
          difficulty: "Medium",
        },
        {
          category: "Transportation",
          type: "success",
          title: "Great Transportation Savings",
          description: "You've reduced transportation costs by using student discounts and walking more",
          potential: 0,
          difficulty: "Maintained",
        },
        {
          category: "Education",
          type: "optimization",
          title: "Textbook Alternatives",
          description: "Consider renting or buying used textbooks to save on education expenses",
          potential: 25,
          difficulty: "Easy",
        },
      ],
      habits: [
        {
          habit: "Coffee shop visits",
          frequency: "12 times/month",
          cost: 48,
          suggestion: "Make coffee at home 50% of the time",
        },
        {
          habit: "Streaming subscriptions",
          frequency: "3 services",
          cost: 35,
          suggestion: "Cancel unused subscriptions",
        },
        { habit: "Food delivery", frequency: "8 times/month", cost: 120, suggestion: "Cook more meals at home" },
      ],
    }
  } else {
    return {
      spendingScore: 92,
      trends: {
        increasing: ["Investments", "Healthcare"],
        decreasing: ["Entertainment"],
        stable: ["Housing", "Food", "Transportation"],
      },
      recommendations: [
        {
          category: "Investments",
          type: "success",
          title: "Excellent Investment Growth",
          description: "You've increased investment contributions by 15%. Consider maxing out your 401(k)",
          potential: 200,
          difficulty: "Medium",
        },
        {
          category: "Food",
          type: "optimization",
          title: "Dining Optimization",
          description: "You could save $120/month by reducing restaurant visits by 2 times per week",
          potential: 120,
          difficulty: "Easy",
        },
        {
          category: "Healthcare",
          type: "alert",
          title: "Healthcare Costs Rising",
          description: "Consider maximizing your HSA contributions for tax benefits and future healthcare costs",
          potential: 150,
          difficulty: "Easy",
        },
        {
          category: "Transportation",
          type: "optimization",
          title: "Commute Efficiency",
          description: "Carpooling or public transit could save $80/month on gas and parking",
          potential: 80,
          difficulty: "Medium",
        },
      ],
      habits: [
        {
          habit: "Business lunches",
          frequency: "15 times/month",
          cost: 300,
          suggestion: "Set a monthly limit of $250",
        },
        {
          habit: "Premium subscriptions",
          frequency: "8 services",
          cost: 120,
          suggestion: "Audit and cancel unused services",
        },
        {
          habit: "Impulse purchases",
          frequency: "5 times/month",
          cost: 200,
          suggestion: "Implement 24-hour waiting rule",
        },
      ],
    }
  }
}

export function SpendingInsights({ userProfile, onViewChange }: SpendingInsightsProps) {
  const [spendingTrends] = useState(getSpendingTrends(userProfile.demographic))
  const [insightsData] = useState(getInsightsData(userProfile.demographic))
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingInsights(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleGoHome = () => {
    onViewChange("welcome")
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", class: "bg-green-100 text-green-800" }
    if (score >= 75) return { text: "Good", class: "bg-yellow-100 text-yellow-800" }
    return { text: "Needs Improvement", class: "bg-red-100 text-red-800" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Spending Insights</h1>
              <p className="text-sm text-slate-600">AI-powered spending analysis and recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.demographic && (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                {userProfile.demographic === "student" ? (
                  <GraduationCap className="h-4 w-4 text-primary" />
                ) : (
                  <Briefcase className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium text-primary capitalize">{userProfile.demographic}</span>
              </div>
            )}
            {userProfile.country && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                <Globe className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {userProfile.country} ({userProfile.currency})
                </span>
              </div>
            )}
            <HomeButton onGoHome={handleGoHome} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Spending Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Spending Score
            </CardTitle>
            <CardDescription>Overall assessment of your spending habits and financial health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(insightsData.spendingScore)}`}>
                  {insightsData.spendingScore}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
              <div className="flex-1">
                <Progress value={insightsData.spendingScore} className="h-3 mb-2" />
                <Badge className={getScoreBadge(insightsData.spendingScore).class}>
                  {getScoreBadge(insightsData.spendingScore).text}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground max-w-xs">
                {insightsData.spendingScore >= 90
                  ? "Outstanding financial discipline! Keep up the excellent work."
                  : insightsData.spendingScore >= 75
                    ? "Good spending habits with room for optimization."
                    : "Focus on the recommendations below to improve your financial health."}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Spending Trends</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="habits">Spending Habits</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Spending Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>6-Month Spending Trends</CardTitle>
                <CardDescription>Track your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    total: { label: "Total Spending", color: "#10b981" },
                    food: { label: "Food", color: "#059669" },
                    housing: { label: "Housing", color: "#047857" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrends}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingUp className="h-4 w-4" />
                    Increasing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insightsData.trends.increasing.map((category) => (
                      <Badge key={category} variant="destructive" className="mr-2">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    Decreasing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insightsData.trends.decreasing.map((category) => (
                      <Badge key={category} className="bg-green-100 text-green-800 mr-2">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Calendar className="h-4 w-4" />
                    Stable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insightsData.trends.stable.map((category) => (
                      <Badge key={category} variant="secondary" className="mr-2">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {isLoadingInsights ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Bot className="h-5 w-5 animate-pulse" />
                    <span>AI is analyzing your spending patterns...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {insightsData.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {rec.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {rec.type === "alert" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                          {rec.type === "optimization" && <Target className="h-5 w-5 text-blue-600" />}
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                        </div>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {rec.potential > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                ${rec.potential}/month potential savings
                              </span>
                            </div>
                          )}
                          <Badge
                            variant={
                              rec.difficulty === "Easy"
                                ? "default"
                                : rec.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {rec.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="habits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Habits Analysis</CardTitle>
                <CardDescription>Recurring spending patterns that impact your budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insightsData.habits.map((habit, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {habit.habit.includes("Coffee") && <Coffee className="h-4 w-4 text-primary" />}
                          {habit.habit.includes("subscription") && <ShoppingCart className="h-4 w-4 text-primary" />}
                          {habit.habit.includes("delivery") && <Car className="h-4 w-4 text-primary" />}
                          {habit.habit.includes("lunch") && <Coffee className="h-4 w-4 text-primary" />}
                          {habit.habit.includes("Premium") && <ShoppingCart className="h-4 w-4 text-primary" />}
                          {habit.habit.includes("Impulse") && <ShoppingCart className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{habit.habit}</h4>
                          <p className="text-sm text-muted-foreground">{habit.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${habit.cost}/month</div>
                        <p className="text-sm text-muted-foreground">{habit.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
                <CardDescription>Actionable steps to improve your financial efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Quick Wins (This Month)</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Cancel unused subscriptions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Set up automatic savings transfer
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Use cashback credit card for regular purchases
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Long-term Goals (3-6 Months)</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Build 3-month emergency fund
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Optimize investment portfolio
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Negotiate better rates on services
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      AI Recommendation
                    </h4>
                    <p className="text-sm">
                      Based on your spending patterns, focusing on the "Quick Wins" could save you approximately{" "}
                      <span className="font-medium text-primary">
                        ${insightsData.recommendations.reduce((sum, rec) => sum + rec.potential, 0)}/month
                      </span>
                      . Start with the easiest changes first to build momentum.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
