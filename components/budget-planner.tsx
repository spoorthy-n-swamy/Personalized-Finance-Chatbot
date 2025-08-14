"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeButton } from "@/components/home-button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  GraduationCap,
  Briefcase,
  Globe,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface BudgetPlannerProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights" | "welcome") => void
}

interface ExpenseCategory {
  id: string
  name: string
  budgeted: number
  spent: number
  color: string
  transactions: Array<{
    id: string
    description: string
    amount: number
    date: string
  }>
}

interface BudgetAnalysis {
  score: number
  suggestions: string[]
  savings_recommendation: string
  emergency_fund: string
  investments: string
}

export function BudgetPlanner({ userProfile, onViewChange }: BudgetPlannerProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    { id: "housing", name: "Housing", budgeted: 0, spent: 0, color: "bg-blue-500", transactions: [] },
    { id: "food", name: "Food & Dining", budgeted: 0, spent: 0, color: "bg-green-500", transactions: [] },
    { id: "transportation", name: "Transportation", budgeted: 0, spent: 0, color: "bg-yellow-500", transactions: [] },
    { id: "utilities", name: "Utilities", budgeted: 0, spent: 0, color: "bg-purple-500", transactions: [] },
    { id: "entertainment", name: "Entertainment", budgeted: 0, spent: 0, color: "bg-pink-500", transactions: [] },
    { id: "healthcare", name: "Healthcare", budgeted: 0, spent: 0, color: "bg-red-500", transactions: [] },
    { id: "shopping", name: "Shopping", budgeted: 0, spent: 0, color: "bg-indigo-500", transactions: [] },
    { id: "other", name: "Other", budgeted: 0, spent: 0, color: "bg-gray-500", transactions: [] },
  ])
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("setup")

  const currencySymbol =
    userProfile.currency === "USD"
      ? "$"
      : userProfile.currency === "EUR"
        ? "€"
        : userProfile.currency === "GBP"
          ? "£"
          : userProfile.currency || "$"

  const totalBudgeted = expenses.reduce((sum, expense) => sum + expense.budgeted, 0)
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.spent, 0)
  const remainingBudget = monthlyIncome - totalBudgeted
  const actualRemaining = monthlyIncome - totalSpent

  const updateExpense = (id: string, field: "budgeted" | "spent", value: number) => {
    setExpenses((prev) => prev.map((expense) => (expense.id === id ? { ...expense, [field]: value } : expense)))
  }

  const analyzeBudget = async () => {
    if (monthlyIncome === 0) return

    setIsAnalyzing(true)
    try {
      const expenseData = expenses.reduce(
        (acc, expense) => {
          acc[expense.name] = expense.spent || expense.budgeted
          return acc
        },
        {} as Record<string, number>,
      )

      const savingsRate = ((monthlyIncome - totalSpent) / monthlyIncome) * 100
      const budgetUtilization = (totalSpent / totalBudgeted) * 100

      let score = 8
      const suggestions = []

      if (savingsRate < 10) {
        score -= 2
        suggestions.push("Your savings rate is below 10%. Try to increase it to at least 20% of your income.")
      }

      if (budgetUtilization > 90) {
        score -= 1
        suggestions.push(
          "You're using over 90% of your budget. Consider reducing expenses in high-spending categories.",
        )
      }

      const highestSpendingCategory = expenses.reduce((max, expense) => (expense.spent > max.spent ? expense : max))

      if (highestSpendingCategory.spent > monthlyIncome * 0.4) {
        suggestions.push(
          `Your ${highestSpendingCategory.name} expenses are quite high. Look for ways to optimize this category.`,
        )
      }

      suggestions.push("Track your daily expenses to identify spending patterns")
      suggestions.push("Set up automatic transfers to your savings account")

      if (userProfile.demographic === "student") {
        suggestions.push("Take advantage of student discounts and free resources")
        suggestions.push("Consider part-time work or internships to increase income")
      } else {
        suggestions.push("Maximize employer 401(k) matching if available")
        suggestions.push("Consider increasing your emergency fund to 6 months of expenses")
      }

      setAnalysis({
        score: Math.max(1, Math.min(10, score)),
        suggestions,
        savings_recommendation: `Based on your income of ${currencySymbol}${monthlyIncome.toLocaleString()}, aim to save ${currencySymbol}${(monthlyIncome * 0.2).toLocaleString()} monthly (20% savings rate)`,
        emergency_fund: `Build an emergency fund of ${currencySymbol}${(totalSpent * 3).toLocaleString()} to ${currencySymbol}${(totalSpent * 6).toLocaleString()} (3-6 months of expenses)`,
        investments:
          userProfile.demographic === "student"
            ? "Start with low-cost index funds and consider a Roth IRA for tax-free growth"
            : "Diversify with index funds, bonds, and consider real estate investment trusts (REITs)",
      })
      setActiveTab("analysis")
    } catch (error) {
      console.error("Budget analysis failed:", error)
      setAnalysis({
        score: 7,
        suggestions: [
          "Unable to connect to AI analysis service. Here are some general recommendations:",
          "Track your spending regularly to identify patterns",
          "Aim to save at least 20% of your income",
          "Review and adjust your budget monthly",
          "Consider automating your savings",
        ],
        savings_recommendation: "Try to save 20% of your monthly income for future goals",
        emergency_fund: "Build an emergency fund covering 3-6 months of expenses",
        investments: "Consider low-cost index funds for long-term growth",
      })
      setActiveTab("analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getHealthColor = (percentage: number) => {
    if (percentage <= 50) return "text-green-600"
    if (percentage <= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getBudgetStatus = () => {
    if (remainingBudget > 0) return { status: "surplus", color: "text-green-600", icon: TrendingUp }
    if (remainingBudget < 0) return { status: "deficit", color: "text-red-600", icon: TrendingDown }
    return { status: "balanced", color: "text-blue-600", icon: Target }
  }

  const budgetStatus = getBudgetStatus()
  const StatusIcon = budgetStatus.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Budget Planner</h1>
              <p className="text-sm text-gray-500">Track and optimize your spending</p>
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
            <HomeButton onGoHome={() => onViewChange("welcome")} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Budget Setup</TabsTrigger>
            <TabsTrigger value="tracking">Expense Tracking</TabsTrigger>
            <TabsTrigger value="analysis">Analysis & Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            {/* Income Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Monthly Income
                </CardTitle>
                <CardDescription>Enter your total monthly income after taxes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label htmlFor="income" className="text-sm font-medium">
                    Monthly Income ({currencySymbol})
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    value={monthlyIncome || ""}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    placeholder="Enter your monthly income"
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Budget Categories
                </CardTitle>
                <CardDescription>Set your monthly budget for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-4 h-4 rounded-full ${expense.color}`} />
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{expense.name}</Label>
                      </div>
                      <Input
                        type="number"
                        value={expense.budgeted || ""}
                        onChange={(e) => updateExpense(expense.id, "budgeted", Number(e.target.value))}
                        placeholder="0"
                        className="w-24"
                      />
                    </div>
                  ))}
                </div>

                {monthlyIncome > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Budgeted:</span>
                      <span className="text-lg font-semibold">
                        {currencySymbol}
                        {totalBudgeted.toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center mt-2 ${budgetStatus.color}`}>
                      <span className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        Remaining Budget:
                      </span>
                      <span className="text-lg font-semibold">
                        {currencySymbol}
                        {Math.abs(remainingBudget).toLocaleString()}
                        {remainingBudget < 0 ? " over budget" : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={analyzeBudget}
                    disabled={isAnalyzing || monthlyIncome === 0 || totalBudgeted === 0}
                    size="lg"
                    className="px-8"
                  >
                    {isAnalyzing ? "Analyzing Your Budget..." : "Get Budget Analysis & Insights"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>View your budget allocation and spending patterns based on your input</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {expenses.map((expense) => {
                    const percentage = expense.budgeted > 0 ? (expense.spent / expense.budgeted) * 100 : 0
                    return (
                      <div key={expense.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${expense.color}`} />
                            <span className="font-medium">{expense.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Budgeted: {currencySymbol}
                              {expense.budgeted.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {currencySymbol}
                              {expense.budgeted.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {expense.budgeted > 0
                                ? `${((expense.budgeted / totalBudgeted) * 100).toFixed(1)}% of budget`
                                : "Not allocated"}
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={expense.budgeted > 0 ? (expense.budgeted / totalBudgeted) * 100 : 0}
                          className="h-2"
                        />

                        {expense.budgeted > 0 && (
                          <div className="ml-6 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Monthly allocation:</span>
                                <span className="font-medium">
                                  {currencySymbol}
                                  {expense.budgeted.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Weekly budget:</span>
                                <span className="font-medium">
                                  {currencySymbol}
                                  {(expense.budgeted / 4).toFixed(0)}
                                </span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Daily budget:</span>
                                <span className="font-medium">
                                  {currencySymbol}
                                  {(expense.budgeted / 30).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currencySymbol}
                          {monthlyIncome.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Monthly Income</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currencySymbol}
                          {totalBudgeted.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Budgeted</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {currencySymbol}
                          {Math.abs(remainingBudget).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {remainingBudget >= 0 ? "Available to Save" : "Over Budget"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={analyzeBudget}
                    disabled={isAnalyzing || monthlyIncome === 0}
                    size="lg"
                    className="px-8"
                  >
                    {isAnalyzing ? "Analyzing Your Budget..." : "Analyze My Budget Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Budget Analysis</CardTitle>
                <CardDescription>Get personalized insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {!analysis && (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No analysis available yet</p>
                    <Button onClick={analyzeBudget} disabled={isAnalyzing || monthlyIncome === 0}>
                      {isAnalyzing ? "Analyzing..." : "Generate Analysis"}
                    </Button>
                  </div>
                )}

                {analysis && (
                  <div className="space-y-6">
                    {/* Budget Score */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.score}/10</div>
                          <div className="text-lg font-medium text-gray-700">Budget Health Score</div>
                          <Progress value={analysis.score * 10} className="mt-4 max-w-xs mx-auto" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Top Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Financial Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Savings Target</Label>
                            <p className="text-sm text-gray-600">{analysis.savings_recommendation}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Emergency Fund</Label>
                            <p className="text-sm text-gray-600">{analysis.emergency_fund}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Investment Strategy</Label>
                            <p className="text-sm text-gray-600">{analysis.investments}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
