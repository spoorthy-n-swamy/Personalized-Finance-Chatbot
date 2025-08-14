"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  GraduationCap,
  Briefcase,
  Bot,
  ArrowLeft,
  Globe,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface BudgetDashboardProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights") => void
}

// Mock budget data based on user demographic
const getBudgetData = (demographic: "student" | "professional" | null) => {
  if (demographic === "student") {
    return {
      income: 1200,
      totalExpenses: 950,
      savings: 250,
      categories: [
        { name: "Housing", amount: 400, budget: 450, icon: Home, color: "#059669" },
        { name: "Food", amount: 200, budget: 250, icon: Coffee, color: "#10b981" },
        { name: "Transportation", amount: 100, budget: 120, icon: Car, color: "#34d399" },
        { name: "Education", amount: 150, budget: 200, icon: GraduationCap, color: "#6ee7b7" },
        { name: "Entertainment", amount: 100, budget: 150, icon: ShoppingCart, color: "#a7f3d0" },
      ],
      insights: [
        "Great job staying under budget in most categories!",
        "Consider meal prepping to reduce food costs further",
        "You're on track to save $3,000 this year",
        "Look into student discounts for transportation",
      ],
    }
  } else {
    return {
      income: 5500,
      totalExpenses: 4200,
      savings: 1300,
      categories: [
        { name: "Housing", amount: 1800, budget: 2000, icon: Home, color: "#059669" },
        { name: "Food", amount: 600, budget: 700, icon: Coffee, color: "#10b981" },
        { name: "Transportation", amount: 400, budget: 500, icon: Car, color: "#34d399" },
        { name: "Healthcare", amount: 300, budget: 350, icon: CreditCard, color: "#6ee7b7" },
        { name: "Entertainment", amount: 500, budget: 600, icon: ShoppingCart, color: "#a7f3d0" },
        { name: "Investments", amount: 600, budget: 800, icon: TrendingUp, color: "#047857" },
      ],
      insights: [
        "Excellent savings rate of 24% - above the recommended 20%",
        "Consider increasing your investment contributions",
        "You're well within budget across all categories",
        "Your emergency fund goal is on track",
      ],
    }
  }
}

export function BudgetDashboard({ userProfile, onViewChange }: BudgetDashboardProps) {
  const [budgetData, setBudgetData] = useState(getBudgetData(userProfile.demographic))
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)

  useEffect(() => {
    // Simulate AI-generated insights loading
    const timer = setTimeout(() => {
      setAiInsights(budgetData.insights)
      setIsLoadingInsights(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [budgetData.insights])

  const handleGoHome = () => {
    onViewChange("budget") // This will trigger the parent to reset to welcome
  }

  const savingsRate = ((budgetData.savings / budgetData.income) * 100).toFixed(1)
  const totalBudget = budgetData.categories.reduce((sum, cat) => sum + cat.budget, 0)
  const budgetUtilization = ((budgetData.totalExpenses / totalBudget) * 100).toFixed(1)

  // Data for pie chart
  const pieData = budgetData.categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }))

  // Data for bar chart
  const barData = budgetData.categories.map((cat) => ({
    name: cat.name,
    spent: cat.amount,
    budget: cat.budget,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button onClick={handleGoHome} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="bg-primary/10 p-2 rounded-full">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Budget Dashboard</h1>
              <p className="text-sm text-slate-600">AI-powered financial insights</p>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${budgetData.income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${budgetData.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                {budgetUtilization}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${budgetData.savings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {savingsRate}% savings rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Excellent
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">All categories on track</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Breakdown</CardTitle>
              <CardDescription>Your expenses by category this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Budget vs Actual Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>How your spending compares to your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  spent: {
                    label: "Spent",
                    color: "#10b981",
                  },
                  budget: {
                    label: "Budget",
                    color: "#e5e7eb",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed view of your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetData.categories.map((category) => {
                const percentage = (category.amount / category.budget) * 100
                const Icon = category.icon
                return (
                  <div key={category.name} className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${category.amount} / ${category.budget}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <Badge
                      variant={percentage > 90 ? "destructive" : percentage > 75 ? "secondary" : "default"}
                      className={
                        percentage <= 75
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : percentage <= 90
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : ""
                      }
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>Personalized recommendations based on your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Analyzing your budget patterns...
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                      <TrendingUp className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
