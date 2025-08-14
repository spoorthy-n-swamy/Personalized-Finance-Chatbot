"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  PiggyBank,
  Calculator,
  Bot,
  Shield,
  MessageCircle,
  MapPin,
  DollarSign,
  BarChart3,
  CreditCard,
  Briefcase,
  GraduationCap,
  Globe,
  Receipt,
  Bell,
  Coffee,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface WelcomeScreenProps {
  userProfile: UserProfile
  onStartChat: () => void
  onShowBudget: () => void
  onShowInsights: () => void
  onShowBudgetPlanner: () => void
  onShowInvestmentTracker: () => void
  onShowSavingsGoals: () => void
  onShowTaxOptimizer: () => void
  onShowFinancialEducation: () => void
  onShowDebtManager: () => void
  onShowBillReminder: () => void
  onShowLifestyleMapper: () => void // Added lifestyle mapper handler
  onShowDemographics: () => void
  onResetProfile: () => void
}

export default function WelcomeScreen({
  userProfile,
  onStartChat,
  onShowBudget,
  onShowInsights,
  onShowBudgetPlanner,
  onShowInvestmentTracker,
  onShowSavingsGoals,
  onShowTaxOptimizer,
  onShowFinancialEducation,
  onShowDebtManager,
  onShowBillReminder,
  onShowLifestyleMapper, // Added lifestyle mapper prop
  onShowDemographics,
  onResetProfile,
}: WelcomeScreenProps) {
  const getGreeting = () => {
    if (userProfile.demographic === "student") {
      return "Welcome back, Future Investor! 🎓"
    } else if (userProfile.demographic === "professional") {
      return "Welcome back, Investor! 📈"
    }
    return "Welcome to FinanceAI! 💰"
  }

  const getDescription = () => {
    if (userProfile.demographic === "student") {
      return "Build your financial knowledge and start your investment journey with student-friendly tools."
    } else if (userProfile.demographic === "professional") {
      return "Manage your portfolio and optimize your financial strategy with professional-grade tools."
    }
    return "Set up your financial profile to get personalized advice and market insights."
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
              <p className="text-gray-600 text-sm">{getDescription()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.demographic && userProfile.country && userProfile.currency ? (
              <div className="flex items-center gap-3">
                {/* User Type Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-full border border-teal-100">
                  {userProfile.demographic === "student" ? (
                    <GraduationCap className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-teal-600" />
                  )}
                  <span className="text-sm font-medium text-teal-700 capitalize">{userProfile.demographic}</span>
                </div>

                {/* Location Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile.country} ({userProfile.currency})
                  </span>
                </div>

                {/* Update Profile Button */}
                <Button
                  onClick={onResetProfile}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            ) : (
              /* About Yourself Button for new users */
              <Button onClick={onShowDemographics} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <MapPin className="h-4 w-4 mr-2" />
                About Yourself
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-600">
                  {userProfile.demographic === "student" ? "Savings" : "Portfolio Value"}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userProfile.demographic === "student" ? "$1,250" : "$12,450"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Monthly Growth</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userProfile.demographic === "student" ? "+12%" : "+8.5%"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">
                  {userProfile.demographic === "student" ? "Emergency Fund" : "Savings Goal"}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userProfile.demographic === "student" ? "45%" : "75%"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">Risk Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userProfile.demographic === "student" ? "Conservative" : "Moderate"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Financial Advisor */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-500 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Active</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Financial Advisor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get personalized financial advice and investment recommendations powered by Watson AI
              </p>
              <Button onClick={onStartChat} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Budget Planner */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-full">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">3 tasks</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Budget Planner</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track expenses, set spending limits, and optimize your monthly budget with AI insights
              </p>
              <Button onClick={onShowBudgetPlanner} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Investment Tracker */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">2 alerts</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Investment Tracker</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor portfolio performance and get real-time market analysis and recommendations
              </p>
              <Button onClick={onShowInvestmentTracker} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Spending Insights */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">1 task</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spending Insights</h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyze spending patterns and discover opportunities to save money with smart recommendations
              </p>
              <Button onClick={onShowInsights} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">4 goals</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Savings Goals</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set and track savings targets for emergency funds, vacations, and major purchases
              </p>
              <Button onClick={onShowSavingsGoals} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Tax Optimizer */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">2 tasks</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tax Optimizer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Maximize deductions and minimize tax liability with AI-powered tax planning strategies
              </p>
              <Button onClick={onShowTaxOptimizer} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Debt Manager */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-500 p-3 rounded-full">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">New</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Debt Manager</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track loans, EMIs, and credit card balances. Get AI-powered strategies to pay off debt faster
              </p>
              <Button onClick={onShowDebtManager} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Bill Reminder & Payment Tracker */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-500 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">New</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bill Reminder & Payment Tracker</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get notified before due dates to avoid late fees and track all your bill payments
              </p>
              <Button onClick={onShowBillReminder} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* AI Lifestyle-to-Finance Mapper */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-500 p-3 rounded-full">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Unique</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Lifestyle-to-Finance Mapper</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect lifestyle choices with financial impact. See how small changes create big savings
              </p>
              <Button onClick={onShowLifestyleMapper} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>

          {/* Financial Education */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal-500 p-3 rounded-full">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Active</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Financial Education</h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn about investing, budgeting, and financial planning with interactive courses and guides
              </p>
              <Button onClick={onShowFinancialEducation} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Open Module →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { WelcomeScreen }
