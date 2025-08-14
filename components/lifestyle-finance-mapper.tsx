"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HomeButton } from "@/components/home-button"
import {
  Coffee,
  Car,
  ShoppingBag,
  Gamepad2,
  Tv,
  TrendingUp,
  Calculator,
  Target,
  IndianRupee,
  ArrowRight,
  Lightbulb,
  PiggyBank,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface LifestyleFinanceMapperProps {
  userProfile: UserProfile
  onViewChange: (view: string) => void
}

interface LifestyleChoice {
  id: string
  category: "food" | "transport" | "entertainment" | "shopping" | "subscriptions"
  name: string
  icon: React.ReactNode
  dailyCost: number
  description: string
  alternatives: string[]
}

interface FinancialProjection {
  monthly: number
  yearly: number
  fiveYear: number
  tenYear: number
  twentyYear: number
}

interface CustomExpense {
  id: string
  amount: number
  description: string
}

const lifestyleChoices: LifestyleChoice[] = [
  {
    id: "coffee",
    category: "food",
    name: "Daily Coffee Shop Visit",
    icon: <Coffee className="h-5 w-5" />,
    dailyCost: 150,
    description: "₹150 per day for premium coffee",
    alternatives: ["Home brewing", "Office coffee", "Reduce to 3x/week"],
  },
  {
    id: "cab",
    category: "transport",
    name: "Daily Cab Rides",
    icon: <Car className="h-5 w-5" />,
    dailyCost: 300,
    description: "₹300 per day for cab commute",
    alternatives: ["Public transport", "Bike/scooter", "Carpooling"],
  },
  {
    id: "dining",
    category: "food",
    name: "Frequent Dining Out",
    icon: <ShoppingBag className="h-5 w-5" />,
    dailyCost: 500,
    description: "₹500 per day on restaurant meals",
    alternatives: ["Home cooking", "Meal prep", "Reduce to weekends only"],
  },
  {
    id: "gaming",
    category: "entertainment",
    name: "Gaming Subscriptions",
    icon: <Gamepad2 className="h-5 w-5" />,
    dailyCost: 100,
    description: "₹100 per day on gaming/apps",
    alternatives: ["Free games", "Annual subscriptions", "Limit purchases"],
  },
  {
    id: "streaming",
    category: "subscriptions",
    name: "Multiple Streaming Services",
    icon: <Tv className="h-5 w-5" />,
    dailyCost: 80,
    description: "₹80 per day on various subscriptions",
    alternatives: ["Share accounts", "Rotate subscriptions", "Free content"],
  },
]

export function LifestyleFinanceMapper({ userProfile, onViewChange }: LifestyleFinanceMapperProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [customAmount, setCustomAmount] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customExpenses, setCustomExpenses] = useState<Array<CustomExpense>>([])

  const calculateProjections = (dailyAmount: number): FinancialProjection => {
    const monthly = dailyAmount * 30
    const yearly = monthly * 12

    // SIP calculations with 12% annual return
    const monthlyReturn = 0.12 / 12
    const fiveYearMonths = 60
    const tenYearMonths = 120
    const twentyYearMonths = 240

    const fiveYear = monthly * (((1 + monthlyReturn) ** fiveYearMonths - 1) / monthlyReturn)
    const tenYear = monthly * (((1 + monthlyReturn) ** tenYearMonths - 1) / monthlyReturn)
    const twentyYear = monthly * (((1 + monthlyReturn) ** twentyYearMonths - 1) / monthlyReturn)

    return {
      monthly,
      yearly,
      fiveYear,
      tenYear,
      twentyYear,
    }
  }

  const getTotalDailyCost = () => {
    const selectedCost = selectedChoices.reduce((total, choiceId) => {
      const choice = lifestyleChoices.find((c) => c.id === choiceId)
      return total + (choice?.dailyCost || 0)
    }, 0)

    const customCost = customExpenses.reduce((total, expense) => total + expense.amount, 0)
    return selectedCost + customCost
  }

  const toggleChoice = (choiceId: string) => {
    setSelectedChoices((prev) => (prev.includes(choiceId) ? prev.filter((id) => id !== choiceId) : [...prev, choiceId]))
  }

  const getCategoryChoices = (category: string) => {
    return lifestyleChoices.filter((choice) => choice.category === category)
  }

  const handleCustomExpenseSubmit = () => {
    if (customAmount && customDescription && Number.parseFloat(customAmount) > 0) {
      const newExpense = {
        id: `custom-${Date.now()}`,
        amount: Number.parseFloat(customAmount),
        description: customDescription,
      }
      setCustomExpenses((prev) => [...prev, newExpense])
      setCustomAmount("")
      setCustomDescription("")
    }
  }

  const removeCustomExpense = (id: string) => {
    setCustomExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const totalProjections = calculateProjections(getTotalDailyCost())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 p-2 rounded-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Lifestyle-to-Finance Mapper</h1>
              <p className="text-gray-600 text-sm">Connect your lifestyle choices with financial impact</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.demographic && (
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                {userProfile.demographic === "student" ? "Student" : "Professional"}
              </Badge>
            )}
            <HomeButton onGoHome={() => onViewChange("welcome")} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="lifestyle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lifestyle">Lifestyle Choices</TabsTrigger>
            <TabsTrigger value="projections">Financial Impact</TabsTrigger>
            <TabsTrigger value="strategies">Optimization Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="lifestyle" className="space-y-6">
            {/* Current Selection Summary */}
            {(selectedChoices.length > 0 || customExpenses.length > 0) && (
              <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="h-6 w-6 text-pink-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Current Selection</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Daily Cost:</p>
                      <p className="text-2xl font-bold text-pink-600">{formatCurrency(getTotalDailyCost())}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Monthly Impact:</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalProjections.monthly)}</p>
                    </div>
                  </div>
                  {/* Custom Expenses */}
                  {customExpenses.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Custom Expenses:</p>
                      <div className="space-y-2">
                        {customExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between bg-white p-2 rounded border"
                          >
                            <span className="text-sm">{expense.description}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">₹{expense.amount}/day</span>
                              <button
                                onClick={() => removeCustomExpense(expense.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lifestyle Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Food & Dining */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    Food & Dining
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getCategoryChoices("food").map((choice) => (
                    <div
                      key={choice.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChoices.includes(choice.id)
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleChoice(choice.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{choice.name}</span>
                        <span className="text-sm font-bold text-orange-600">₹{choice.dailyCost}/day</span>
                      </div>
                      <p className="text-xs text-gray-600">{choice.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Transportation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Transportation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getCategoryChoices("transport").map((choice) => (
                    <div
                      key={choice.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChoices.includes(choice.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleChoice(choice.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{choice.name}</span>
                        <span className="text-sm font-bold text-blue-600">₹{choice.dailyCost}/day</span>
                      </div>
                      <p className="text-xs text-gray-600">{choice.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Entertainment & Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-purple-600" />
                    Entertainment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getCategoryChoices("entertainment")
                    .concat(getCategoryChoices("subscriptions"))
                    .map((choice) => (
                      <div
                        key={choice.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedChoices.includes(choice.id)
                            ? "bg-purple-50 border-purple-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleChoice(choice.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{choice.name}</span>
                          <span className="text-sm font-bold text-purple-600">₹{choice.dailyCost}/day</span>
                        </div>
                        <p className="text-xs text-gray-600">{choice.description}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Custom Expense */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  Custom Lifestyle Expense
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customAmount">Daily Amount (₹)</Label>
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="Enter daily cost"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customDescription">Description</Label>
                    <Input
                      id="customDescription"
                      placeholder="e.g., Daily snacks, Gym membership"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                    />
                  </div>
                </div>
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleCustomExpenseSubmit}
                    disabled={!customAmount || !customDescription || Number.parseFloat(customAmount) <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Custom Expense
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            {getTotalDailyCost() > 0 ? (
              <>
                {/* Impact Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-500 p-2 rounded-lg">
                          <Calculator className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-orange-700">Monthly Cost</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-800">
                        {formatCurrency(totalProjections.monthly)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-blue-700">5-Year SIP Potential</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {formatCurrency(totalProjections.fiveYear)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-green-700">10-Year SIP Potential</span>
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        {formatCurrency(totalProjections.tenYear)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-500 p-2 rounded-lg">
                          <PiggyBank className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-purple-700">20-Year SIP Potential</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-800">
                        {formatCurrency(totalProjections.twentyYear)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      Investment Growth Projection (12% Annual Return)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">If you invest daily savings in SIP</p>
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalDailyCost())}/day</p>
                          <p className="text-sm text-gray-500">→ {formatCurrency(totalProjections.monthly)}/month</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Your wealth in 10 years</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalProjections.tenYear)}
                          </p>
                          <p className="text-sm text-gray-500">Compound growth power!</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Lifestyle Choices</h3>
                  <p className="text-gray-600">
                    Choose your daily expenses from the Lifestyle Choices tab to see the financial impact
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            {selectedChoices.length > 0 ? (
              <div className="space-y-6">
                {selectedChoices.map((choiceId) => {
                  const choice = lifestyleChoices.find((c) => c.id === choiceId)
                  if (!choice) return null

                  const choiceProjections = calculateProjections(choice.dailyCost)

                  return (
                    <Card key={choice.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          {choice.icon}
                          <span>{choice.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            ₹{choice.dailyCost}/day
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Alternative Strategies:</h4>
                            <ul className="space-y-2">
                              {choice.alternatives.map((alt, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">{alt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Investment Potential:</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">5 years:</span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(choiceProjections.fiveYear)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">10 years:</span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(choiceProjections.tenYear)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">20 years:</span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(choiceProjections.twentyYear)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Overall Strategy */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-green-600" />
                      Recommended Action Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 1: Reduce</h4>
                          <p className="text-sm text-gray-600">Cut 50% of selected expenses using alternatives</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 2: Invest</h4>
                          <p className="text-sm text-gray-600">Start SIP with saved amount immediately</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Step 3: Track</h4>
                          <p className="text-sm text-gray-600">Monitor progress and adjust monthly</p>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-100 rounded-lg">
                        <p className="text-lg font-semibold text-green-800">
                          Potential 10-year wealth creation: {formatCurrency(totalProjections.tenYear / 2)}
                        </p>
                        <p className="text-sm text-green-600">By reducing just 50% of your lifestyle expenses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Strategies Available</h3>
                  <p className="text-gray-600">Select lifestyle choices to see personalized optimization strategies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
