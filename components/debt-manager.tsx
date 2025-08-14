"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HomeButton } from "@/components/home-button"
import {
  Receipt,
  CreditCard,
  Home,
  Car,
  Plus,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface DebtManagerProps {
  userProfile: UserProfile
  onViewChange: (view: "welcome") => void
}

interface Debt {
  id: string
  name: string
  type: "credit-card" | "personal-loan" | "home-loan" | "car-loan" | "education-loan"
  balance: number
  interestRate: number
  minimumPayment: number
  dueDate: string
  status: "current" | "overdue" | "paid-off"
}

export function DebtManager({ userProfile, onViewChange }: DebtManagerProps) {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "1",
      name: "HDFC Credit Card",
      type: "credit-card",
      balance: 45000,
      interestRate: 36,
      minimumPayment: 2250,
      dueDate: "2024-01-15",
      status: "current",
    },
    {
      id: "2",
      name: "Personal Loan - ICICI",
      type: "personal-loan",
      balance: 180000,
      interestRate: 14.5,
      minimumPayment: 8500,
      dueDate: "2024-01-20",
      status: "current",
    },
    {
      id: "3",
      name: "Car Loan - SBI",
      type: "car-loan",
      balance: 320000,
      interestRate: 8.5,
      minimumPayment: 12000,
      dueDate: "2024-01-25",
      status: "current",
    },
  ])

  const [newDebt, setNewDebt] = useState({
    name: "",
    type: "credit-card" as const,
    balance: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
  })

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const highestInterestRate = Math.max(...debts.map((debt) => debt.interestRate))

  const getDebtIcon = (type: string) => {
    switch (type) {
      case "credit-card":
        return <CreditCard className="h-5 w-5" />
      case "home-loan":
        return <Home className="h-5 w-5" />
      case "car-loan":
        return <Car className="h-5 w-5" />
      default:
        return <Receipt className="h-5 w-5" />
    }
  }

  const getDebtTypeColor = (type: string) => {
    switch (type) {
      case "credit-card":
        return "bg-red-100 text-red-800"
      case "home-loan":
        return "bg-blue-100 text-blue-800"
      case "car-loan":
        return "bg-green-100 text-green-800"
      case "personal-loan":
        return "bg-orange-100 text-orange-800"
      case "education-loan":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.interestRate && newDebt.minimumPayment) {
      const debt: Debt = {
        id: Date.now().toString(),
        name: newDebt.name,
        type: newDebt.type,
        balance: Number.parseFloat(newDebt.balance),
        interestRate: Number.parseFloat(newDebt.interestRate),
        minimumPayment: Number.parseFloat(newDebt.minimumPayment),
        dueDate: newDebt.dueDate,
        status: "current",
      }
      setDebts([...debts, debt])
      setNewDebt({
        name: "",
        type: "credit-card",
        balance: "",
        interestRate: "",
        minimumPayment: "",
        dueDate: "",
      })
    }
  }

  const getPayoffStrategies = () => {
    const sortedByInterest = [...debts].sort((a, b) => b.interestRate - a.interestRate)
    const sortedByBalance = [...debts].sort((a, b) => a.balance - b.balance)

    return {
      avalanche: sortedByInterest,
      snowball: sortedByBalance,
    }
  }

  const strategies = getPayoffStrategies()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Debt Manager</h1>
              <p className="text-gray-600 text-sm">Track loans, EMIs, and credit card balances</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HomeButton onGoHome={() => onViewChange("welcome")} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-600">Total Debt</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{totalDebt.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-600">Monthly EMIs</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{totalMinimumPayment.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-600">Highest Interest</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{highestInterestRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Active Debts</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {debts.filter((debt) => debt.status === "current").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Debt Overview</TabsTrigger>
            <TabsTrigger value="add">Add Debt</TabsTrigger>
            <TabsTrigger value="strategies">Payoff Strategies</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4">
              {debts.map((debt) => (
                <Card key={debt.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg">{getDebtIcon(debt.type)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDebtTypeColor(debt.type)}>
                              {debt.type.replace("-", " ").toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Due: {new Date(debt.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">₹{debt.balance.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">
                          {debt.interestRate}% APR • Min: ₹{debt.minimumPayment.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Debt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debt-name">Debt Name</Label>
                    <Input
                      id="debt-name"
                      placeholder="e.g., HDFC Credit Card"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="debt-type">Debt Type</Label>
                    <select
                      id="debt-type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newDebt.type}
                      onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value as any })}
                    >
                      <option value="credit-card">Credit Card</option>
                      <option value="personal-loan">Personal Loan</option>
                      <option value="home-loan">Home Loan</option>
                      <option value="car-loan">Car Loan</option>
                      <option value="education-loan">Education Loan</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="balance">Outstanding Balance (₹)</Label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="50000"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <Input
                      id="interest-rate"
                      type="number"
                      step="0.1"
                      placeholder="18.5"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum-payment">Minimum Payment (₹)</Label>
                    <Input
                      id="minimum-payment"
                      type="number"
                      placeholder="2500"
                      value={newDebt.minimumPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Next Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={newDebt.dueDate}
                      onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addDebt} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Debt Avalanche Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Pay minimums on all debts, then focus extra payments on highest interest rate debt first.
                  </p>
                  <div className="space-y-3">
                    {strategies.avalanche.map((debt, index) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">
                            #{index + 1} {debt.name}
                          </span>
                          <div className="text-sm text-gray-600">{debt.interestRate}% APR</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{debt.balance.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Debt Snowball Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Pay minimums on all debts, then focus extra payments on smallest balance first for motivation.
                  </p>
                  <div className="space-y-3">
                    {strategies.snowball.map((debt, index) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">
                            #{index + 1} {debt.name}
                          </span>
                          <div className="text-sm text-gray-600">{debt.interestRate}% APR</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{debt.balance.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Debt Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Priority Recommendation</h4>
                    <p className="text-blue-800">
                      Focus on paying off your HDFC Credit Card first (36% APR). Even an extra ₹1,000/month could save
                      you ₹8,500 in interest over the next year.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Debt Consolidation Opportunity</h4>
                    <p className="text-green-800">
                      Consider consolidating your high-interest debts into a personal loan at 12-14% APR. This could
                      reduce your monthly payments by ₹3,200.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">⚡ Quick Win Strategy</h4>
                    <p className="text-yellow-800">
                      If you can increase your monthly debt payments by 20% (₹4,500 extra), you could become debt-free
                      18 months earlier and save ₹45,000 in interest.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
