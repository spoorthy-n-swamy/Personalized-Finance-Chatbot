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
  Target,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  PiggyBank,
  Car,
  Home,
  Plane,
  GraduationCap,
  Heart,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface SavingsGoalsProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights" | "budget-planner" | "investment-tracker" | "welcome") => void
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: "high" | "medium" | "low"
  monthlyContribution: number
  icon: string
  color: string
}

interface GoalRecommendation {
  goal_name: string
  recommended_monthly: number
  timeline_months: number
  priority_level: string
  tips: string[]
}

export function SavingsGoals({ userProfile, onViewChange }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 5000,
      currentAmount: 2250,
      targetDate: "2024-12-31",
      category: "Emergency",
      priority: "high",
      monthlyContribution: 300,
      icon: "shield",
      color: "bg-red-500",
    },
    {
      id: "2",
      name: "Vacation to Europe",
      targetAmount: 3000,
      currentAmount: 800,
      targetDate: "2024-08-15",
      category: "Travel",
      priority: "medium",
      monthlyContribution: 200,
      icon: "plane",
      color: "bg-blue-500",
    },
    {
      id: "3",
      name: "New Laptop",
      targetAmount: 1500,
      currentAmount: 600,
      targetDate: "2024-06-01",
      category: "Technology",
      priority: "low",
      monthlyContribution: 150,
      icon: "laptop",
      color: "bg-purple-500",
    },
  ])

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 0,
    targetDate: "",
    category: "",
    priority: "medium" as "high" | "medium" | "low",
    monthlyContribution: 0,
  })

  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const currencySymbol =
    userProfile.currency === "USD"
      ? "$"
      : userProfile.currency === "EUR"
        ? "€"
        : userProfile.currency === "GBP"
          ? "£"
          : userProfile.currency || "$"

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "emergency":
        return <PiggyBank className="h-5 w-5" />
      case "travel":
        return <Plane className="h-5 w-5" />
      case "car":
        return <Car className="h-5 w-5" />
      case "house":
        return <Home className="h-5 w-5" />
      case "education":
        return <GraduationCap className="h-5 w-5" />
      case "health":
        return <Heart className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0
  }

  const calculateMonthsToGoal = (current: number, target: number, monthly: number) => {
    if (monthly <= 0) return Number.POSITIVE_INFINITY
    return Math.ceil((target - current) / monthly)
  }

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount > 0) {
      const goal: SavingsGoal = {
        id: Date.now().toString(),
        ...newGoal,
        currentAmount: 0,
        icon: newGoal.category.toLowerCase(),
        color: `bg-${["blue", "green", "purple", "orange", "red", "indigo"][Math.floor(Math.random() * 6)]}-500`,
      }
      setGoals([...goals, goal])
      setNewGoal({
        name: "",
        targetAmount: 0,
        targetDate: "",
        category: "",
        priority: "medium",
        monthlyContribution: 0,
      })
    }
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, currentAmount: Math.max(0, goal.currentAmount + amount) } : goal,
      ),
    )
  }

  const getGoalRecommendations = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/savings-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: goals.map((goal) => ({
            name: goal.name,
            target: goal.targetAmount,
            current: goal.currentAmount,
            monthly: goal.monthlyContribution,
            category: goal.category,
            priority: goal.priority,
          })),
          user_context: {
            userType: userProfile.demographic,
            country: userProfile.country,
            currency: userProfile.currency,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setRecommendations(result.recommendations || [])
      } else {
        console.error("API call failed:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error details:", errorText)
      }
    } catch (error) {
      console.error("Goal recommendations failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalMonthlyContribution = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Savings Goals</h1>
              <p className="text-sm text-gray-500">Track and achieve your financial targets</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.demographic && userProfile.country && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
                  🎓 {userProfile.demographic === "student" ? "Student" : "Professional"}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  🌍 {userProfile.country} ({userProfile.currency})
                </Badge>
              </div>
            )}
            <HomeButton onGoHome={() => onViewChange("welcome")} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Total Goals</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Target Amount</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {totalTargetAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <PiggyBank className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Saved So Far</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {totalCurrentAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-600">Monthly Savings</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {totalMonthlyContribution.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-2xl font-bold text-green-600">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>
                {currencySymbol}
                {totalCurrentAmount.toLocaleString()} saved
              </span>
              <span>
                {currencySymbol}
                {totalTargetAmount.toLocaleString()} target
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="add">Add Goal</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
                const monthsToGoal = calculateMonthsToGoal(
                  goal.currentAmount,
                  goal.targetAmount,
                  goal.monthlyContribution,
                )
                const isCompleted = progress >= 100

                return (
                  <Card key={goal.id} className={isCompleted ? "border-green-500 bg-green-50" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${goal.color}`}>
                            <div className="text-white">{getIcon(goal.category)}</div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            <CardDescription>{goal.category}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {currencySymbol}
                            {goal.currentAmount.toLocaleString()}
                          </span>
                          <span>
                            {currencySymbol}
                            {goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Target Date</Label>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-500">Monthly Contribution</Label>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>
                              {currencySymbol}
                              {goal.monthlyContribution}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {monthsToGoal === Number.POSITIVE_INFINITY
                              ? "Set monthly contribution"
                              : `${monthsToGoal} months to reach goal`}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 50)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add {currencySymbol}50
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 100)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add {currencySymbol}100
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeGoal(goal.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {goals.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first savings goal to track your progress.</p>
                <Button onClick={() => setNewGoal({ ...newGoal })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Savings Goal
                </CardTitle>
                <CardDescription>Set a target and track your progress toward achieving it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input
                      id="goalName"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="Emergency Fund"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      placeholder="Emergency, Travel, Car, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount ({currencySymbol})</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newGoal.targetAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyContribution">Monthly Contribution ({currencySymbol})</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={newGoal.monthlyContribution || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: Number(e.target.value) })}
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={newGoal.priority}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, priority: e.target.value as "high" | "medium" | "low" })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Savings Recommendations</CardTitle>
                <CardDescription>Get personalized advice to optimize your savings strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getGoalRecommendations} disabled={isAnalyzing || goals.length === 0} className="mb-6">
                  {isAnalyzing ? "Analyzing..." : "Get Recommendations"}
                </Button>

                {recommendations.length > 0 && (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{rec.goal_name}</h4>
                            <Badge className={getPriorityColor(rec.priority_level)}>{rec.priority_level}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-sm text-gray-500">Recommended Monthly</Label>
                              <div className="text-lg font-semibold text-green-600">
                                {currencySymbol}
                                {rec.recommended_monthly}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Timeline</Label>
                              <div className="text-lg font-semibold text-blue-600">{rec.timeline_months} months</div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500 mb-2 block">Tips</Label>
                            <ul className="space-y-1">
                              {rec.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
