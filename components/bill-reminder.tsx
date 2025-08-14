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
  Bell,
  Calendar,
  CreditCard,
  Zap,
  Wifi,
  Car,
  Home,
  Phone,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface BillReminderProps {
  userProfile: UserProfile
  onViewChange: (view: "welcome") => void
}

interface Bill {
  id: string
  name: string
  category: "utilities" | "insurance" | "subscription" | "loan" | "credit-card" | "rent" | "other"
  amount: number
  dueDate: string
  frequency: "monthly" | "quarterly" | "yearly"
  status: "paid" | "pending" | "overdue"
  autoPayEnabled: boolean
  reminderDays: number
}

export function BillReminder({ userProfile, onViewChange }: BillReminderProps) {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: "1",
      name: "Electricity Bill - MSEB",
      category: "utilities",
      amount: 2500,
      dueDate: "2024-01-15",
      frequency: "monthly",
      status: "pending",
      autoPayEnabled: false,
      reminderDays: 3,
    },
    {
      id: "2",
      name: "Internet - Airtel Fiber",
      category: "utilities",
      amount: 999,
      dueDate: "2024-01-10",
      frequency: "monthly",
      status: "paid",
      autoPayEnabled: true,
      reminderDays: 5,
    },
    {
      id: "3",
      name: "Car Insurance - HDFC ERGO",
      category: "insurance",
      amount: 15000,
      dueDate: "2024-03-20",
      frequency: "yearly",
      status: "pending",
      autoPayEnabled: false,
      reminderDays: 30,
    },
    {
      id: "4",
      name: "Netflix Subscription",
      category: "subscription",
      amount: 649,
      dueDate: "2024-01-18",
      frequency: "monthly",
      status: "pending",
      autoPayEnabled: true,
      reminderDays: 2,
    },
    {
      id: "5",
      name: "Home Rent",
      category: "rent",
      amount: 25000,
      dueDate: "2024-01-05",
      frequency: "monthly",
      status: "overdue",
      autoPayEnabled: false,
      reminderDays: 5,
    },
  ])

  const [newBill, setNewBill] = useState({
    name: "",
    category: "utilities" as const,
    amount: "",
    dueDate: "",
    frequency: "monthly" as const,
    reminderDays: "3",
  })

  const totalMonthlyBills = bills
    .filter((bill) => bill.frequency === "monthly")
    .reduce((sum, bill) => sum + bill.amount, 0)

  const upcomingBills = bills.filter((bill) => {
    const dueDate = new Date(bill.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0 && bill.status === "pending"
  })

  const overdueBills = bills.filter((bill) => bill.status === "overdue")

  const getBillIcon = (category: string) => {
    switch (category) {
      case "utilities":
        return <Zap className="h-5 w-5" />
      case "insurance":
        return <Car className="h-5 w-5" />
      case "subscription":
        return <Wifi className="h-5 w-5" />
      case "rent":
        return <Home className="h-5 w-5" />
      case "credit-card":
        return <CreditCard className="h-5 w-5" />
      case "loan":
        return <Phone className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "utilities":
        return "bg-yellow-100 text-yellow-800"
      case "insurance":
        return "bg-blue-100 text-blue-800"
      case "subscription":
        return "bg-purple-100 text-purple-800"
      case "rent":
        return "bg-green-100 text-green-800"
      case "credit-card":
        return "bg-red-100 text-red-800"
      case "loan":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const addBill = () => {
    if (newBill.name && newBill.amount && newBill.dueDate) {
      const bill: Bill = {
        id: Date.now().toString(),
        name: newBill.name,
        category: newBill.category,
        amount: Number.parseFloat(newBill.amount),
        dueDate: newBill.dueDate,
        frequency: newBill.frequency,
        status: "pending",
        autoPayEnabled: false,
        reminderDays: Number.parseInt(newBill.reminderDays),
      }
      setBills([...bills, bill])
      setNewBill({
        name: "",
        category: "utilities",
        amount: "",
        dueDate: "",
        frequency: "monthly",
        reminderDays: "3",
      })
    }
  }

  const markAsPaid = (billId: string) => {
    setBills(bills.map((bill) => (bill.id === billId ? { ...bill, status: "paid" as const } : bill)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Reminder & Payment Tracker</h1>
              <p className="text-gray-600 text-sm">Never miss a payment and avoid late fees</p>
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
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Monthly Bills</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{totalMonthlyBills.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-600">Due This Week</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{upcomingBills.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{overdueBills.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Auto-Pay Enabled</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {bills.filter((bill) => bill.autoPayEnabled).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming Bills</TabsTrigger>
            <TabsTrigger value="all">All Bills</TabsTrigger>
            <TabsTrigger value="add">Add Bill</TabsTrigger>
            <TabsTrigger value="insights">Payment Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {overdueBills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ Overdue Bills</h3>
                <div className="grid gap-4 mb-6">
                  {overdueBills.map((bill) => (
                    <Card key={bill.id} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-lg">{getBillIcon(bill.category)}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{bill.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getCategoryColor(bill.category)}>{bill.category.toUpperCase()}</Badge>
                                <span className="text-sm text-red-600 font-medium">
                                  Overdue since {new Date(bill.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">₹{bill.amount.toLocaleString()}</div>
                            </div>
                            <Button
                              onClick={() => markAsPaid(bill.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Paid
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Due This Week</h3>
              <div className="grid gap-4">
                {upcomingBills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 p-3 rounded-lg">{getBillIcon(bill.category)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{bill.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getCategoryColor(bill.category)}>{bill.category.toUpperCase()}</Badge>
                              <span className="text-sm text-gray-600">
                                Due: {new Date(bill.dueDate).toLocaleDateString()}
                              </span>
                              {bill.autoPayEnabled && <Badge className="bg-green-100 text-green-800">AUTO-PAY</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">₹{bill.amount.toLocaleString()}</div>
                          </div>
                          <Button onClick={() => markAsPaid(bill.id)} size="sm" variant="outline">
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-4">
              {bills.map((bill) => (
                <Card key={bill.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg">{getBillIcon(bill.category)}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{bill.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(bill.category)}>{bill.category.toUpperCase()}</Badge>
                            <span className="text-sm text-gray-600">
                              {bill.frequency.toUpperCase()} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </span>
                            {bill.autoPayEnabled && <Badge className="bg-green-100 text-green-800">AUTO-PAY</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(bill.status)}
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">₹{bill.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600 capitalize">{bill.status}</div>
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
                <CardTitle>Add New Bill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bill-name">Bill Name</Label>
                    <Input
                      id="bill-name"
                      placeholder="e.g., Electricity Bill - MSEB"
                      value={newBill.name}
                      onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bill-category">Category</Label>
                    <select
                      id="bill-category"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newBill.category}
                      onChange={(e) => setNewBill({ ...newBill, category: e.target.value as any })}
                    >
                      <option value="utilities">Utilities</option>
                      <option value="insurance">Insurance</option>
                      <option value="subscription">Subscription</option>
                      <option value="rent">Rent</option>
                      <option value="credit-card">Credit Card</option>
                      <option value="loan">Loan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="bill-amount">Amount (₹)</Label>
                    <Input
                      id="bill-amount"
                      type="number"
                      placeholder="2500"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newBill.frequency}
                      onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value as any })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reminder-days">Reminder (Days Before)</Label>
                    <Input
                      id="reminder-days"
                      type="number"
                      placeholder="3"
                      value={newBill.reminderDays}
                      onChange={(e) => setNewBill({ ...newBill, reminderDays: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addBill} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Auto-Pay Recommendation</h4>
                    <p className="text-blue-800">
                      Enable auto-pay for your recurring bills to avoid late fees. You could save ₹2,000+ annually in
                      late payment charges.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">📊 Spending Pattern</h4>
                    <p className="text-green-800">
                      Your monthly bills total ₹{totalMonthlyBills.toLocaleString()}. Consider setting up a separate
                      account for bill payments to better manage cash flow.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">⏰ Payment Timing</h4>
                    <p className="text-yellow-800">
                      Most of your bills are due in the first half of the month. Consider negotiating due dates to
                      spread them throughout the month for better cash flow.
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
