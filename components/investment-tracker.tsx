"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  Plus,
  Minus,
  BarChart3,
  Target,
  Activity,
  Search,
  GraduationCap,
  Briefcase,
  Globe,
} from "lucide-react"
import { HomeButton } from "@/components/home-button"

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface InvestmentTrackerProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights" | "budget-planner" | "investment-tracker" | "welcome") => void
}

interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  currentPrice: number
  sector: string
  color: string
  lastUpdated?: string
}

interface StockQuote {
  symbol: string
  company_name: string
  price: number
  change: number
  change_percent: number
  market_cap: number
  pe_ratio?: number
  volume: number
  currency: string
  exchange?: string
  sector?: string
  last_updated?: string
}

interface PortfolioAnalysis {
  diversification_score: number
  risk_level: string
  rebalancing: string
  projections: string
  tax_tips: string
}

export function InvestmentTracker({ userProfile, onViewChange }: InvestmentTrackerProps) {
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: "1",
      symbol: "RELIANCE",
      name: "Reliance Industries",
      shares: 10,
      purchasePrice: 1300,
      currentPrice: 1384,
      sector: "Oil & Gas",
      color: "bg-blue-500",
    },
    {
      id: "2",
      symbol: "TCS",
      name: "Tata Consultancy Services",
      shares: 5,
      purchasePrice: 2900,
      currentPrice: 3032,
      sector: "IT Services",
      color: "bg-green-500",
    },
    {
      id: "3",
      symbol: "HDFCBANK",
      name: "HDFC Bank",
      shares: 8,
      purchasePrice: 1850,
      currentPrice: 1976,
      sector: "Banking",
      color: "bg-purple-500",
    },
  ])

  const [newInvestment, setNewInvestment] = useState({
    symbol: "",
    name: "",
    shares: 0,
    purchasePrice: 0,
    currentPrice: 0,
    sector: "",
  })

  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  const [stockSearch, setStockSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [marketOverview, setMarketOverview] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [allStocks, setAllStocks] = useState<any[]>([])

  const currencySymbol =
    userProfile.currency === "USD"
      ? "$"
      : userProfile.currency === "EUR"
        ? "€"
        : userProfile.currency === "GBP"
          ? "£"
          : userProfile.currency === "INR"
            ? "₹"
            : userProfile.currency === "ALL"
              ? "L"
              : userProfile.currency || "₹"

  useEffect(() => {
    checkApiStatus()
    loadMarketOverview()
    loadAllStocks()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/market-overview", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        setApiStatus("connected")
        return true
      } else {
        setApiStatus("disconnected")
        return false
      }
    } catch (error) {
      console.log("Backend API unavailable:", error)
      setApiStatus("disconnected")
      return false
    }
  }

  const loadMarketOverview = async () => {
    try {
      const response = await fetch("http://localhost:8000/market-overview")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMarketOverview(data.data)
          setApiStatus("connected")
        }
      } else {
        throw new Error("API request failed")
      }
    } catch (error) {
      console.log("Market overview unavailable, using mock data:", error)
      setApiStatus("disconnected")
      setMarketOverview({
        indices: {
          "NIFTY 50": {
            value: 21500,
            change: 1.2,
            change_percent: 0.56,
          },
          SENSEX: {
            value: 71000,
            change: 850,
            change_percent: 1.21,
          },
        },
        market_stats: {
          total_companies: 20,
          average_pe_ratio: 22.5,
          market_status: "Open",
        },
        top_gainers: [],
        top_losers: [],
        most_active: [],
      })
    }
  }

  const loadAllStocks = async () => {
    try {
      const isApiAvailable = await checkApiStatus()

      if (isApiAvailable) {
        const response = await fetch("http://localhost:8000/stock-search?q=")
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAllStocks(data.data)
            setApiStatus("connected")
          }
        } else {
          throw new Error("API request failed")
        }
      } else {
        throw new Error("Backend API unavailable")
      }
    } catch (error) {
      console.log("Loading all stocks failed, using fallback list:", error)
      setApiStatus("disconnected")

      const fallbackStocks = [
        {
          symbol: "RELIANCE",
          company_name: "Reliance Industries",
          sector: "Oil & Gas",
          exchange: "NSE",
          currency: "INR",
        },
        {
          symbol: "TCS",
          company_name: "Tata Consultancy Services",
          sector: "IT Services",
          exchange: "NSE",
          currency: "INR",
        },
        { symbol: "HDFCBANK", company_name: "HDFC Bank", sector: "Banking", exchange: "NSE", currency: "INR" },
        { symbol: "INFY", company_name: "Infosys", sector: "IT Services", exchange: "NSE", currency: "INR" },
        { symbol: "ICICIBANK", company_name: "ICICI Bank", sector: "Banking", exchange: "NSE", currency: "INR" },
        {
          symbol: "BHARTIARTL",
          company_name: "Bharti Airtel",
          sector: "Telecommunications",
          exchange: "NSE",
          currency: "INR",
        },
        { symbol: "ITC", company_name: "ITC Ltd.", sector: "FMCG", exchange: "NSE", currency: "INR" },
        { symbol: "SBIN", company_name: "State Bank of India", sector: "Banking", exchange: "NSE", currency: "INR" },
        { symbol: "LT", company_name: "Larsen & Toubro", sector: "Construction", exchange: "NSE", currency: "INR" },
        { symbol: "HINDUNILVR", company_name: "Hindustan Unilever", sector: "FMCG", exchange: "NSE", currency: "INR" },
        {
          symbol: "KOTAKBANK",
          company_name: "Kotak Mahindra Bank",
          sector: "Banking",
          exchange: "NSE",
          currency: "INR",
        },
        {
          symbol: "BAJFINANCE",
          company_name: "Bajaj Finance",
          sector: "Financial Services",
          exchange: "NSE",
          currency: "INR",
        },
        { symbol: "MARUTI", company_name: "Maruti Suzuki", sector: "Automobile", exchange: "NSE", currency: "INR" },
        {
          symbol: "SUNPHARMA",
          company_name: "Sun Pharmaceutical",
          sector: "Pharmaceuticals",
          exchange: "NSE",
          currency: "INR",
        },
        { symbol: "ULTRACEMCO", company_name: "UltraTech Cement", sector: "Cement", exchange: "NSE", currency: "INR" },
        { symbol: "NTPC", company_name: "NTPC Limited", sector: "Power", exchange: "NSE", currency: "INR" },
        { symbol: "AXISBANK", company_name: "Axis Bank", sector: "Banking", exchange: "NSE", currency: "INR" },
        {
          symbol: "HCLTECH",
          company_name: "HCL Technologies",
          sector: "IT Services",
          exchange: "NSE",
          currency: "INR",
        },
        { symbol: "WIPRO", company_name: "Wipro Limited", sector: "IT Services", exchange: "NSE", currency: "INR" },
        { symbol: "TECHM", company_name: "Tech Mahindra", sector: "IT Services", exchange: "NSE", currency: "INR" },
      ]
      setAllStocks(fallbackStocks)
    }
  }

  const updateAllPrices = async () => {
    if (investments.length === 0) return

    setIsUpdatingPrices(true)
    try {
      const isApiAvailable = await checkApiStatus()

      if (isApiAvailable) {
        const symbols = investments.map((inv) => inv.symbol)
        const response = await fetch("http://localhost:8000/stock-quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(symbols),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const updatedInvestments = investments.map((inv) => {
              const quote = data.data[inv.symbol]
              if (quote && quote.price) {
                return {
                  ...inv,
                  currentPrice: quote.price,
                  name: quote.company_name || inv.name,
                  sector: quote.sector || inv.sector,
                  lastUpdated: new Date().toLocaleTimeString(),
                }
              }
              return inv
            })
            setInvestments(updatedInvestments)
            setLastUpdateTime(new Date().toLocaleTimeString())
            setApiStatus("connected")
          }
        } else {
          throw new Error("API request failed")
        }
      } else {
        throw new Error("Backend API unavailable")
      }
    } catch (error) {
      console.log("Price update failed, using simulated prices:", error)
      setApiStatus("disconnected")

      const updatedInvestments = investments.map((inv) => {
        const changePercent = (Math.random() - 0.5) * 0.06 // ±3% change
        const newPrice = inv.currentPrice * (1 + changePercent)
        return {
          ...inv,
          currentPrice: Math.round(newPrice * 100) / 100,
          lastUpdated: new Date().toLocaleTimeString() + " (simulated)",
        }
      })
      setInvestments(updatedInvestments)
      setLastUpdateTime(new Date().toLocaleTimeString() + " (simulated)")
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  const searchStocks = async () => {
    if (!stockSearch.trim()) return

    setIsSearching(true)
    try {
      const isApiAvailable = await checkApiStatus()

      if (isApiAvailable) {
        const response = await fetch(`http://localhost:8000/stock-search?q=${encodeURIComponent(stockSearch)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setSearchResults(data.data)
            setApiStatus("connected")
          }
        } else {
          throw new Error("API request failed")
        }
      } else {
        throw new Error("Backend API unavailable")
      }
    } catch (error) {
      console.log("Stock search failed, using fallback results:", error)
      setApiStatus("disconnected")

      const fallbackStocks = [
        { symbol: "RELIANCE", company_name: "Reliance Industries", sector: "Oil & Gas" },
        { symbol: "TCS", company_name: "Tata Consultancy Services", sector: "IT Services" },
        { symbol: "HDFCBANK", company_name: "HDFC Bank", sector: "Banking" },
        { symbol: "INFY", company_name: "Infosys", sector: "IT Services" },
        { symbol: "ICICIBANK", company_name: "ICICI Bank", sector: "Banking" },
        { symbol: "BHARTIARTL", company_name: "Bharti Airtel", sector: "Telecommunications" },
        { symbol: "ITC", company_name: "ITC Ltd.", sector: "FMCG" },
        { symbol: "SBIN", company_name: "State Bank of India", sector: "Banking" },
        { symbol: "LT", company_name: "Larsen & Toubro", sector: "Construction" },
        { symbol: "HINDUNILVR", company_name: "Hindustan Unilever", sector: "FMCG" },
      ]

      const query = stockSearch.toLowerCase()
      const results = fallbackStocks
        .filter(
          (stock) =>
            stock.symbol.toLowerCase().includes(query) ||
            stock.company_name.toLowerCase().includes(query) ||
            stock.sector.toLowerCase().includes(query),
        )
        .map((stock) => ({
          symbol: stock.symbol,
          name: stock.company_name,
          sector: stock.sector,
          exchange: "NSE",
          currency: "INR",
        }))
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }

  const getStockQuote = async (symbol: string) => {
    try {
      const isApiAvailable = await checkApiStatus()

      if (isApiAvailable) {
        const response = await fetch(`http://localhost:8000/stock-quote/${symbol}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setApiStatus("connected")
            return data.data
          }
        }
      }
      throw new Error("API unavailable")
    } catch (error) {
      console.log(`Failed to get quote for ${symbol}, using estimated price:`, error)
      setApiStatus("disconnected")

      const estimatedPrices: { [key: string]: number } = {
        RELIANCE: 1384,
        TCS: 3032,
        HDFCBANK: 1976,
        BHARTIARTL: 1855,
        ICICIBANK: 1419,
        SBIN: 822,
        INFY: 1427,
        HINDUNILVR: 2485,
        LICI: 918,
        BAJFINANCE: 8525,
        ITC: 416,
        LT: 3694,
        HCLTECH: 1494,
        "M&M": 3244,
        MARUTI: 12750,
        KOTAKBANK: 1970,
        SUNPHARMA: 1619,
        ULTRACEMCO: 12455,
        NTPC: 341,
        AXISBANK: 1066,
      }

      return {
        symbol: symbol,
        company_name: symbol,
        price: estimatedPrices[symbol] || 500 + Math.random() * 1000,
        change: 0,
        change_percent: 0,
        currency: "INR",
      }
    }
  }

  const addInvestment = async () => {
    if (newInvestment.symbol && newInvestment.shares > 0) {
      let currentPrice = newInvestment.currentPrice
      let name = newInvestment.name

      if (!currentPrice || !name) {
        const quote = await getStockQuote(newInvestment.symbol)
        if (quote) {
          currentPrice = quote.price || newInvestment.currentPrice
          name = quote.company_name || newInvestment.name
          if (!name) {
            name = newInvestment.symbol
          }
        }
      }

      const investment: Investment = {
        id: Date.now().toString(),
        ...newInvestment,
        name: name || newInvestment.symbol,
        currentPrice: currentPrice || newInvestment.currentPrice,
        color: `bg-${["blue", "green", "purple", "orange", "red", "indigo"][Math.floor(Math.random() * 6)]}-500`,
        lastUpdated: new Date().toLocaleTimeString(),
      }
      setInvestments([...investments, investment])
      setNewInvestment({
        symbol: "",
        name: "",
        shares: 0,
        purchasePrice: 0,
        currentPrice: 0,
        sector: "",
      })
      setSearchResults([])
      setStockSearch("")
      setSelectedStock(null)
      setIsDropdownOpen(false)
    }
  }

  const selectStock = (stock: any) => {
    setSelectedStock(stock)
    setNewInvestment({
      ...newInvestment,
      symbol: stock.symbol,
      name: stock.company_name || stock.name,
      sector: stock.sector || "",
    })
    setIsDropdownOpen(false)
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.shares * inv.currentPrice, 0)
  const totalCost = investments.reduce((sum, inv) => sum + inv.shares * inv.purchasePrice, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  const removeInvestment = (id: string) => {
    setInvestments(investments.filter((inv) => inv.id !== id))
  }

  const analyzePortfolio = async () => {
    if (investments.length === 0) return

    setIsAnalyzing(true)
    try {
      const portfolioData = {
        investments: investments.map((inv) => ({
          symbol: inv.symbol,
          value: inv.shares * inv.currentPrice,
          sector: inv.sector,
          gainLoss: (inv.currentPrice - inv.purchasePrice) * inv.shares,
        })),
        totalValue,
        totalGainLoss,
      }

      try {
        const response = await fetch("http://localhost:8000/investment-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio: portfolioData,
            user_context: {
              userType: userProfile.demographic,
              country: userProfile.country,
              currency: userProfile.currency,
              age: userProfile.demographic === "student" ? 22 : 35,
              riskTolerance: userProfile.demographic === "student" ? "Moderate" : "Aggressive",
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setAnalysis(result)
        } else {
          throw new Error("API request failed")
        }
      } catch (apiError) {
        console.log("Using fallback analysis due to API unavailability")

        const techStocks = investments.filter((inv) => inv.sector.toLowerCase().includes("tech")).length
        const totalStocks = investments.length
        const avgGainLoss = totalGainLoss / totalStocks

        const diversificationScore = Math.min(
          10,
          Math.max(
            1,
            (totalStocks >= 5 ? 3 : totalStocks) +
              (techStocks / totalStocks < 0.6 ? 3 : 1) +
              (totalValue > 10000 ? 2 : 1) +
              (avgGainLoss > 0 ? 2 : 0),
          ),
        )

        const riskLevel =
          userProfile.demographic === "student"
            ? techStocks / totalStocks > 0.7
              ? "High Risk"
              : "Moderate Risk"
            : totalValue > 50000
              ? "Balanced Risk"
              : "Growth-Focused"

        const rebalancing =
          diversificationScore < 6
            ? `Consider diversifying across more sectors. Currently ${Math.round((techStocks / totalStocks) * 100)}% in technology.`
            : "Your portfolio shows good diversification across sectors."

        const projections =
          userProfile.demographic === "student"
            ? `With ${totalStocks} holdings and ${currencySymbol}${totalValue.toLocaleString()} invested, you're building a solid foundation. Consider dollar-cost averaging for consistent growth.`
            : `Your ${currencySymbol}${totalValue.toLocaleString()} portfolio shows ${totalGainLoss >= 0 ? "positive" : "negative"} momentum. Focus on long-term wealth building strategies.`

        const taxTips =
          userProfile.demographic === "student"
            ? "As a student, consider tax-advantaged accounts like Roth IRA for tax-free growth. Hold investments longer than 1 year for favorable capital gains rates."
            : "Consider tax-loss harvesting opportunities and maximize contributions to 401(k) and IRA accounts for tax efficiency."

        setAnalysis({
          diversification_score: diversificationScore,
          risk_level: riskLevel,
          rebalancing: rebalancing,
          projections: projections,
          tax_tips: taxTips,
        })
      }
    } catch (error) {
      console.error("Portfolio analysis failed:", error)
      setAnalysis({
        diversification_score: 5,
        risk_level: "Moderate Risk",
        rebalancing: "Unable to analyze at this time. Please try again later.",
        projections: "Portfolio analysis temporarily unavailable.",
        tax_tips: "Consult with a financial advisor for personalized tax strategies.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getGainLossColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  const getGainLossIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Investment Tracker</h1>
              <p className="text-sm text-gray-500">Monitor and optimize your portfolio</p>
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
        {apiStatus === "disconnected" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Database connection unavailable. Using demo data for Indian stocks. To enable live data, ensure the
                  backend server is running and database is populated.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {marketOverview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Indian Market Overview
                <Badge variant="outline" className="text-xs">
                  {apiStatus === "connected" ? "Live" : "Demo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {marketOverview.indices?.["NIFTY 50"]?.value?.toLocaleString() || "21,500"}
                  </div>
                  <div className="text-sm text-gray-600">NIFTY 50</div>
                  <div
                    className={`text-xs ${marketOverview.indices?.["NIFTY 50"]?.change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {marketOverview.indices?.["NIFTY 50"]?.change >= 0 ? "+" : ""}
                    {marketOverview.indices?.["NIFTY 50"]?.change_percent?.toFixed(2) || "0.56"}%
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {marketOverview.indices?.["SENSEX"]?.value?.toLocaleString() || "71,000"}
                  </div>
                  <div className="text-sm text-gray-600">SENSEX</div>
                  <div
                    className={`text-xs ${marketOverview.indices?.["SENSEX"]?.change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {marketOverview.indices?.["SENSEX"]?.change >= 0 ? "+" : ""}
                    {marketOverview.indices?.["SENSEX"]?.change_percent?.toFixed(2) || "1.21"}%
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {marketOverview.market_stats?.total_companies || 20}
                  </div>
                  <div className="text-sm text-gray-600">Tracked Stocks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {marketOverview.market_stats?.average_pe_ratio?.toFixed(1) || "22.5"}
                  </div>
                  <div className="text-sm text-gray-600">Avg P/E Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ... existing portfolio overview cards ... */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total Value</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {totalValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Total Gain/Loss</span>
              </div>
              <div className={`text-2xl font-bold ${getGainLossColor(totalGainLoss)}`}>
                {totalGainLoss >= 0 ? "+" : ""}
                {currencySymbol}
                {Math.abs(totalGainLoss).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Return %</span>
              </div>
              <div className={`text-2xl font-bold ${getGainLossColor(totalGainLossPercent)}`}>
                {totalGainLossPercent >= 0 ? "+" : ""}
                {totalGainLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-600">Holdings</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="add">Add Investment</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Your Holdings
                </CardTitle>
                <CardDescription>Track performance of individual investments with real-time data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment) => {
                    const currentValue = investment.shares * investment.currentPrice
                    const gainLoss = (investment.currentPrice - investment.purchasePrice) * investment.shares
                    const gainLossPercent =
                      investment.purchasePrice > 0
                        ? (gainLoss / (investment.shares * investment.purchasePrice)) * 100
                        : 0
                    const GainLossIcon = getGainLossIcon(gainLoss)

                    return (
                      <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${investment.color}`} />
                          <div>
                            <div className="font-medium">{investment.symbol}</div>
                            <div className="text-sm text-gray-500">{investment.name}</div>
                            <div className="text-xs text-gray-400">{investment.sector}</div>
                            {investment.lastUpdated && (
                              <div className="text-xs text-green-600">Updated: {investment.lastUpdated}</div>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-500">Shares</div>
                          <div className="font-medium">{investment.shares}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-500">Current Price</div>
                          <div className="font-medium">
                            {currencySymbol}
                            {investment.currentPrice}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-500">Value</div>
                          <div className="font-medium">
                            {currencySymbol}
                            {currentValue.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-500">Gain/Loss</div>
                          <div className={`font-medium flex items-center gap-1 ${getGainLossColor(gainLoss)}`}>
                            <GainLossIcon className="h-4 w-4" />
                            {gainLoss >= 0 ? "+" : ""}
                            {currencySymbol}
                            {Math.abs(gainLoss).toFixed(2)}
                            <span className="text-xs">({gainLossPercent.toFixed(1)}%)</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInvestment(investment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}

                  {investments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No investments added yet. Start by adding your first investment!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Investment
                </CardTitle>
                <CardDescription>Track a new stock, ETF, or other investment with real-time data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stockDropdown">Select Stock from Database</Label>
                    <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isDropdownOpen}
                          className="w-full justify-between bg-transparent"
                        >
                          {selectedStock
                            ? `${selectedStock.symbol} - ${selectedStock.company_name || selectedStock.name}`
                            : "Search and select a stock..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search stocks by symbol or name..." />
                          <CommandList>
                            <CommandEmpty>No stocks found.</CommandEmpty>
                            <CommandGroup>
                              {allStocks.map((stock) => (
                                <CommandItem
                                  key={stock.symbol}
                                  value={`${stock.symbol} ${stock.company_name || stock.name}`}
                                  onSelect={() => selectStock(stock)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedStock?.symbol === stock.symbol ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <div className="font-medium">{stock.symbol}</div>
                                    <div className="text-sm text-gray-500">{stock.company_name || stock.name}</div>
                                    <div className="text-xs text-gray-400">
                                      {stock.sector} • {stock.exchange || "NSE"}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <span>or</span>
                  </div>

                  <div>
                    <Label htmlFor="stockSearch">Manual Stock Search</Label>
                    <div className="flex gap-2">
                      <Input
                        id="stockSearch"
                        value={stockSearch}
                        onChange={(e) => setStockSearch(e.target.value)}
                        placeholder="Search by symbol or company name..."
                        onKeyPress={(e) => e.key === "Enter" && searchStocks()}
                      />
                      <Button onClick={searchStocks} disabled={isSearching}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <Label className="text-sm font-medium">Manual Search Results:</Label>
                      {searchResults.map((stock, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => selectStock(stock)}
                        >
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-gray-500">{stock.name || stock.company_name}</div>
                            <div className="text-xs text-gray-400">{stock.sector}</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newInvestment.symbol}
                      onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value.toUpperCase() })}
                      placeholder="AAPL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={newInvestment.name}
                      onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                      placeholder="Apple Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="shares">Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      value={newInvestment.shares || ""}
                      onChange={(e) => setNewInvestment({ ...newInvestment, shares: Number(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price ({currencySymbol})</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={newInvestment.purchasePrice || ""}
                      onChange={(e) => setNewInvestment({ ...newInvestment, purchasePrice: Number(e.target.value) })}
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentPrice">Current Price ({currencySymbol}) - Optional</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={newInvestment.currentPrice || ""}
                      onChange={(e) => setNewInvestment({ ...newInvestment, currentPrice: Number(e.target.value) })}
                      placeholder="Will fetch automatically if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={newInvestment.sector}
                      onChange={(e) => setNewInvestment({ ...newInvestment, sector: e.target.value })}
                      placeholder="Technology"
                    />
                  </div>
                </div>
                <Button onClick={addInvestment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Portfolio Analysis</CardTitle>
                <CardDescription>Get personalized investment insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={analyzePortfolio} disabled={isAnalyzing || investments.length === 0} className="mb-6">
                  {isAnalyzing ? "Analyzing..." : "Analyze Portfolio"}
                </Button>

                {analysis && (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {analysis.diversification_score}/10
                          </div>
                          <div className="text-lg font-medium text-gray-700">Diversification Score</div>
                          <Progress value={analysis.diversification_score * 10} className="mt-4 max-w-xs mx-auto" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Risk Assessment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Risk Level</Label>
                              <p className="text-lg font-semibold text-orange-600">{analysis.risk_level}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Rebalancing Advice</Label>
                              <p className="text-sm text-gray-600">{analysis.rebalancing}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Growth Projections
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Expected Returns</Label>
                            <p className="text-sm text-gray-600">{analysis.projections}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Tax Optimization</Label>
                            <p className="text-sm text-gray-600">{analysis.tax_tips}</p>
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
