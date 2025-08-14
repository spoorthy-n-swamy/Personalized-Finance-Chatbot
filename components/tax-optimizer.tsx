"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeButton } from "@/components/home-button"
import {
  Calculator,
  DollarSign,
  FileText,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
  Receipt,
  Building,
  Heart,
  GraduationCap,
  Home,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
  age?: number
  state?: string
}

interface TaxOptimizerProps {
  userProfile: UserProfile
  onViewChange: (
    view: "chat" | "budget" | "insights" | "budget-planner" | "investment-tracker" | "savings-goals" | "welcome",
  ) => void
}

interface TaxDeduction {
  id: string
  category: string
  description: string
  amount: number
  eligible: boolean
  documentation: string[]
  icon: string
  color: string
}

interface TaxStrategy {
  strategy_name: string
  potential_savings: number
  recommended_contribution?: number
  employer_match_potential?: number
  total_benefit?: number
  implementation_steps: string[]
  deadline: string
  priority: string
  tax_bracket_impact?: string
  unique_benefit?: string
  ongoing_benefit?: string
  additional_benefit?: string
}

interface TaxAnalysis {
  current_tax_situation: {
    gross_income: number
    total_deductions: number
    taxable_income: number
    tax_calculation: {
      base_tax: number
      health_education_cess: number
      total_tax_liability: number
      effective_tax_rate: number
    }
    tax_regime_comparison: {
      old_regime_benefit: string
      new_regime_benefit: string
      recommendation: string
    }
  }
  optimization_summary: {
    total_potential_savings: number
    high_priority_actions: number
    implementation_timeline: string
  }
}

export function TaxOptimizer({ userProfile, onViewChange }: TaxOptimizerProps) {
  const [annualIncome, setAnnualIncome] = useState<number>(0)
  const [filingStatus, setFilingStatus] = useState<string>("single")
  const [age, setAge] = useState<number>(30)
  const [state, setState] = useState<string>("Maharashtra")
  const [deductions, setDeductions] = useState<TaxDeduction[]>([
    {
      id: "1",
      category: "PPF",
      description: "Public Provident Fund contributions",
      amount: 50000,
      eligible: true,
      documentation: ["PPF account statement", "Deposit receipts"],
      icon: "heart",
      color: "bg-green-500",
    },
    {
      id: "2",
      category: "Health Insurance",
      description: "Health insurance premium for self and family",
      amount: 25000,
      eligible: true,
      documentation: ["Premium receipts", "Policy documents"],
      icon: "heart",
      color: "bg-blue-500",
    },
    {
      id: "3",
      category: "ELSS",
      description: "Equity Linked Savings Scheme mutual funds",
      amount: 30000,
      eligible: true,
      documentation: ["ELSS certificates", "Investment statements"],
      icon: "graduation",
      color: "bg-purple-500",
    },
  ])

  const [newDeduction, setNewDeduction] = useState({
    category: "",
    description: "",
    amount: 0,
    documentation: "",
  })

  const [strategies, setStrategies] = useState<TaxStrategy[]>([])
  const [taxAnalysis, setTaxAnalysis] = useState<TaxAnalysis | null>(null)
  const [taxAnalysisText, setTaxAnalysisText] = useState<string>("")
  const [nextSteps, setNextSteps] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const currencySymbol = "₹"

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "ppf":
      case "epf":
      case "nps":
        return <Target className="h-5 w-5" />
      case "health insurance":
      case "medical":
        return <Heart className="h-5 w-5" />
      case "elss":
      case "mutual funds":
        return <TrendingUp className="h-5 w-5" />
      case "home loan interest":
      case "home":
        return <Home className="h-5 w-5" />
      case "life insurance":
        return <Heart className="h-5 w-5" />
      case "nsc":
      case "fixed deposits":
        return <Building className="h-5 w-5" />
      case "education loan":
        return <GraduationCap className="h-5 w-5" />
      default:
        return <Receipt className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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

  const totalDeductions = deductions.filter((d) => d.eligible).reduce((sum, d) => sum + d.amount, 0)
  const basicExemptionLimit = 400000 // ₹4,00,000 basic exemption limit
  const taxableIncome = Math.max(0, annualIncome - totalDeductions)
  const isAboveExemptionLimit = annualIncome > basicExemptionLimit

  const addDeduction = () => {
    if (newDeduction.category && newDeduction.amount > 0) {
      const deduction: TaxDeduction = {
        id: Date.now().toString(),
        ...newDeduction,
        eligible: true,
        documentation: newDeduction.documentation.split(",").map((doc) => doc.trim()),
        icon: newDeduction.category.toLowerCase(),
        color: `bg-${["blue", "green", "purple", "orange", "red", "indigo"][Math.floor(Math.random() * 6)]}-500`,
      }
      setDeductions([...deductions, deduction])
      setNewDeduction({
        category: "",
        description: "",
        amount: 0,
        documentation: "",
      })
    }
  }

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter((d) => d.id !== id))
  }

  const toggleDeductionEligibility = (id: string) => {
    setDeductions(deductions.map((d) => (d.id === id ? { ...d, eligible: !d.eligible } : d)))
  }

  const getTaxStrategies = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/tax-optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annual_income: annualIncome,
          filing_status: filingStatus,
          age: age,
          state: state,
          deductions: deductions.map((d) => ({
            category: d.category,
            amount: d.amount,
            eligible: d.eligible,
          })),
          user_context: {
            userType: userProfile.demographic,
            country: userProfile.country,
            currency: "INR",
            age: age,
            state: state,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setStrategies(result.strategies || [])
      setTaxAnalysis(result.detailed_tax_analysis || null)
      setTaxAnalysisText(result.tax_analysis || "")
      setNextSteps(result.next_steps || [])
    } catch (error) {
      console.error("Tax optimization failed:", error)
      alert("Tax calculation failed. Please check your input and try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Indian Tax Optimizer</h1>
              <p className="text-sm text-gray-500">
                Maximize deductions and minimize tax liability using Indian tax laws
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile.demographic && userProfile.country && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
                  🎓 {userProfile.demographic === "student" ? "Student" : "Professional"}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  🇮🇳 India (INR)
                </Badge>
              </div>
            )}
            <HomeButton onGoHome={() => onViewChange("welcome")} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Tax Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Annual Income</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {(annualIncome || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total Deductions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {(totalDeductions || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Taxable Income</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {currencySymbol}
                {(taxableIncome || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-600">Potential Savings</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {taxAnalysis?.optimization_summary?.total_potential_savings
                  ? `${currencySymbol}${taxAnalysis.optimization_summary.total_potential_savings.toLocaleString()}`
                  : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-600">Tax Status</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{isAboveExemptionLimit ? "Taxable" : "Exempt"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Tax Setup</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="strategies">Tax Strategies</TabsTrigger>
            <TabsTrigger value="analysis">Tax Analysis</TabsTrigger>
            <TabsTrigger value="calendar">Tax Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Indian Tax Information Setup
                </CardTitle>
                <CardDescription>
                  Enter your basic tax information for optimization using Indian tax laws
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="income">Annual Income ({currencySymbol})</Label>
                    <Input
                      id="income"
                      type="number"
                      value={annualIncome || ""}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      placeholder="1200000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filing">Filing Status</Label>
                    <select
                      id="filing"
                      value={filingStatus}
                      onChange={(e) => setFilingStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="individual">Individual</option>
                      <option value="huf">Hindu Undivided Family (HUF)</option>
                      <option value="senior_citizen">Senior Citizen</option>
                      <option value="super_senior_citizen">Super Senior Citizen</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age || ""}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={getTaxStrategies}
                    disabled={isAnalyzing || annualIncome === 0}
                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    {isAnalyzing ? "Calculating Tax..." : "Calculate Tax Optimization"}
                  </Button>
                </div>

                {annualIncome > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Indian Tax Slab Information (FY 2024-25)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-gray-900">Basic Exemption Limit</div>
                        <div className="text-2xl font-bold text-blue-600">{currencySymbol}4,00,000</div>
                        <div className="text-sm text-gray-500">No tax up to this limit</div>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-gray-900">Your Taxable Income</div>
                        <div className="text-2xl font-bold text-green-600">
                          {currencySymbol}
                          {(taxableIncome || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">After deductions</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        {isAboveExemptionLimit ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">
                          {isAboveExemptionLimit
                            ? "You are liable to pay income tax. Optimize with deductions!"
                            : "Your income is below the taxable limit"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded border">
                      <h5 className="font-medium mb-3">Indian Tax Slab Rates (Individual - New Regime)</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Income Range (₹)</th>
                              <th className="text-left py-2">Tax Rate</th>
                            </tr>
                          </thead>
                          <tbody className="space-y-1">
                            <tr className="border-b">
                              <td className="py-2">Up to ₹4,00,000</td>
                              <td className="py-2 font-medium text-green-600">Nil</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">₹4,00,001 – ₹8,00,000</td>
                              <td className="py-2 font-medium text-blue-600">5%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">₹8,00,001 – ₹12,00,000</td>
                              <td className="py-2 font-medium text-purple-600">10%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">₹12,00,001 – ₹16,00,000</td>
                              <td className="py-2 font-medium text-orange-600">15%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">₹16,00,001 – ₹20,00,000</td>
                              <td className="py-2 font-medium text-red-600">20%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">₹20,00,001 – ₹24,00,000</td>
                              <td className="py-2 font-medium text-red-700">25%</td>
                            </tr>
                            <tr>
                              <td className="py-2">Above ₹24,00,000</td>
                              <td className="py-2 font-medium text-red-800">30%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">* Plus 4% Health and Education Cess on total tax</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Indian Tax Deductions Tracker
                </CardTitle>
                <CardDescription>
                  Track and manage your tax-deductible investments under Indian tax laws
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deductions.map((deduction) => (
                    <div
                      key={deduction.id}
                      className={`p-4 border rounded-lg ${deduction.eligible ? "bg-white" : "bg-gray-50 opacity-60"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${deduction.color}`}>
                            <div className="text-white">{getIcon(deduction.category)}</div>
                          </div>
                          <div>
                            <div className="font-medium">{deduction.category}</div>
                            <div className="text-sm text-gray-500">{deduction.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Documentation: {deduction.documentation.join(", ")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {currencySymbol}
                              {(deduction.amount || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Investment</div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={deduction.eligible ? "default" : "outline"}
                              onClick={() => toggleDeductionEligibility(deduction.id)}
                            >
                              {deduction.eligible ? "Eligible" : "Not Eligible"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeDeduction(deduction.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Deduction */}
                <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <h4 className="font-medium mb-4">Add New Tax-Saving Investment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newCategory">Category</Label>
                      <select
                        id="newCategory"
                        value={newDeduction.category}
                        onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Category</option>
                        <option value="PPF">PPF (Section 80C)</option>
                        <option value="ELSS">ELSS (Section 80C)</option>
                        <option value="EPF">EPF (Section 80C)</option>
                        <option value="NSC">NSC (Section 80C)</option>
                        <option value="Life Insurance">Life Insurance (Section 80C)</option>
                        <option value="Health Insurance">Health Insurance (Section 80D)</option>
                        <option value="NPS">NPS (Section 80CCD-1B)</option>
                        <option value="Home Loan Interest">Home Loan Interest (Section 24)</option>
                        <option value="Education Loan">Education Loan Interest (Section 80E)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="newAmount">Amount ({currencySymbol})</Label>
                      <Input
                        id="newAmount"
                        type="number"
                        value={newDeduction.amount || ""}
                        onChange={(e) => setNewDeduction({ ...newDeduction, amount: Number(e.target.value) })}
                        placeholder="50000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="newDescription">Description</Label>
                      <Input
                        id="newDescription"
                        value={newDeduction.description}
                        onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })}
                        placeholder="Public Provident Fund investment for tax saving"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="newDocumentation">Required Documentation (comma-separated)</Label>
                      <Input
                        id="newDocumentation"
                        value={newDeduction.documentation}
                        onChange={(e) => setNewDeduction({ ...newDeduction, documentation: e.target.value })}
                        placeholder="Investment receipts, Account statements, Certificates"
                      />
                    </div>
                  </div>
                  <Button onClick={addDeduction} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Investment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tax Optimization Strategies
                </CardTitle>
                <CardDescription>Get personalized tax-saving recommendations based on Indian tax laws</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getTaxStrategies} disabled={isAnalyzing || annualIncome === 0} className="mb-6">
                  <Calculator className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "Calculating Tax Strategies..." : "Get Tax Optimization Strategies"}
                </Button>

                {taxAnalysisText && (
                  <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Calculator className="h-5 w-5" />
                        Tax Analysis & Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm text-blue-900 leading-relaxed">{taxAnalysisText}</div>
                    </CardContent>
                  </Card>
                )}

                {strategies.length > 0 && (
                  <div className="space-y-4">
                    {strategies.map((strategy, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg">{strategy.strategy_name}</h4>
                            <div className="flex items-center gap-3">
                              <Badge className={getPriorityColor(strategy.priority)}>{strategy.priority}</Badge>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  Save {currencySymbol}
                                  {(strategy.potential_savings || 0).toLocaleString()}
                                </div>
                                {strategy.total_benefit && (
                                  <div className="text-sm text-gray-600">
                                    Total Benefit: {currencySymbol}
                                    {(strategy.total_benefit || 0).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <Label className="text-sm text-gray-500 mb-2 block">Implementation Steps</Label>
                              <ul className="space-y-2">
                                {strategy.implementation_steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm text-gray-500">Deadline</Label>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-red-500" />
                                  <span className="font-semibold text-red-600">{strategy.deadline}</span>
                                </div>
                              </div>

                              {strategy.recommended_contribution && (
                                <div>
                                  <Label className="text-sm text-gray-500">Recommended Investment</Label>
                                  <div className="text-lg font-semibold text-blue-600">
                                    {currencySymbol}
                                    {(strategy.recommended_contribution || 0).toLocaleString()}
                                  </div>
                                </div>
                              )}

                              {strategy.tax_bracket_impact && (
                                <div>
                                  <Label className="text-sm text-gray-500">Tax Impact</Label>
                                  <div className="text-sm font-medium text-purple-600">
                                    {strategy.tax_bracket_impact}
                                  </div>
                                </div>
                              )}

                              {(strategy.unique_benefit || strategy.ongoing_benefit || strategy.additional_benefit) && (
                                <div>
                                  <Label className="text-sm text-gray-500">Special Benefits</Label>
                                  <div className="text-sm text-green-700">
                                    {strategy.unique_benefit || strategy.ongoing_benefit || strategy.additional_benefit}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {nextSteps.length > 0 && (
                  <Card className="mt-6 bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Target className="h-5 w-5" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {taxAnalysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Detailed Tax Analysis (Indian Tax System)
                    </CardTitle>
                    <CardDescription>
                      Comprehensive breakdown of your tax situation under Indian tax laws
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4">Current Tax Situation</h4>
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">Gross Income</div>
                            <div className="text-lg font-bold text-blue-600">
                              {currencySymbol}
                              {(taxAnalysis.current_tax_situation.gross_income || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">Total Deductions</div>
                            <div className="text-lg font-bold text-green-600">
                              {currencySymbol}
                              {(taxAnalysis.current_tax_situation.total_deductions || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">Taxable Income</div>
                            <div className="text-lg font-bold text-purple-600">
                              {currencySymbol}
                              {(taxAnalysis.current_tax_situation.taxable_income || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Tax Calculation Breakdown</h4>
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">Base Tax</div>
                            <div className="text-lg font-bold text-red-600">
                              {currencySymbol}
                              {(taxAnalysis.current_tax_situation.tax_calculation.base_tax || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">Health & Education Cess (4%)</div>
                            <div className="text-lg font-bold text-orange-600">
                              {currencySymbol}
                              {(
                                taxAnalysis.current_tax_situation.tax_calculation.health_education_cess || 0
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg bg-gray-50">
                            <div className="font-medium">Total Tax Liability</div>
                            <div className="text-xl font-bold text-gray-900">
                              {currencySymbol}
                              {(
                                taxAnalysis.current_tax_situation.tax_calculation.total_tax_liability || 0
                              ).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Effective Rate:{" "}
                              {taxAnalysis.current_tax_situation.tax_calculation.effective_tax_rate || 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Optimization Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {currencySymbol}
                          {(taxAnalysis.optimization_summary.total_potential_savings || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">Total Potential Savings</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {taxAnalysis.optimization_summary.high_priority_actions || 0}
                        </div>
                        <div className="text-sm text-blue-700">High Priority Actions</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-700">Implementation Timeline</div>
                        <div className="text-sm text-orange-600 mt-1">
                          {taxAnalysis.optimization_summary.implementation_timeline || "Not available"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!taxAnalysis && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                  <p className="text-gray-600 mb-4">
                    Run the Tax Optimization Strategies to see detailed tax breakdown
                  </p>
                  <Button onClick={() => getTaxStrategies()} disabled={annualIncome === 0}>
                    Generate Tax Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Indian Tax Calendar & Deadlines</CardTitle>
                <CardDescription>Important tax dates and reminders for Indian taxpayers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Upcoming Deadlines</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-red-600">July 31, 2025</div>
                        <div className="text-sm text-gray-600">ITR Filing Due Date</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-orange-600">March 31, 2025</div>
                        <div className="text-sm text-gray-600">Investment Deadline (80C, 80D, NPS)</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-blue-600">June 15, 2024</div>
                        <div className="text-sm text-gray-600">Q1 Advance Tax Payment</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Year-End Planning</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium">March 31</div>
                        <div className="text-sm text-gray-600">Complete all tax-saving investments</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium">March 31</div>
                        <div className="text-sm text-gray-600">Pay health insurance premiums</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium">May 31</div>
                        <div className="text-sm text-gray-600">Receive Form 16 from employer</div>
                      </div>
                    </div>
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
