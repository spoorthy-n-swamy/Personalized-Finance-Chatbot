"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import WelcomeScreen from "@/components/welcome-screen"
import { DemographicsSelection } from "@/components/demographics-selection"
import { CountrySelection } from "@/components/country-selection"
import { BudgetDashboard } from "@/components/budget-dashboard"
import { SpendingInsights } from "@/components/spending-insights"
import { BudgetPlanner } from "@/components/budget-planner"
import { InvestmentTracker } from "@/components/investment-tracker"
import { SavingsGoals } from "@/components/savings-goals"
import { TaxOptimizer } from "@/components/tax-optimizer"
import { FinancialEducation } from "@/components/financial-education"
import { DebtManager } from "@/components/debt-manager"
import { BillReminder } from "@/components/bill-reminder"
import { LifestyleFinanceMapper } from "@/components/lifestyle-finance-mapper"

type UserDemographic = "student" | "professional" | null
type CurrentView =
  | "welcome"
  | "demographics"
  | "country"
  | "chat"
  | "budget"
  | "insights"
  | "budget-planner"
  | "investment-tracker"
  | "savings-goals"
  | "tax-optimizer"
  | "financial-education"
  | "debt-manager"
  | "bill-reminder"
  | "lifestyle-mapper"

interface UserProfile {
  demographic: UserDemographic
  country: string | null
  currency: string | null
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<CurrentView>("welcome")
  const [userProfile, setUserProfile] = useState<UserProfile>({
    demographic: null,
    country: null,
    currency: null,
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setUserProfile(parsedProfile)
      } catch (error) {
        console.error("Error loading saved profile:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (userProfile.demographic || userProfile.country) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile))
    }
  }, [userProfile])

  const handleStartDemographics = () => {
    setCurrentView("demographics")
  }

  const handleDemographicSelected = (demographic: "student" | "professional") => {
    setUserProfile((prev) => ({ ...prev, demographic }))
    setCurrentView("country")
  }

  const handleCountrySelected = (country: string, currency: string) => {
    setUserProfile((prev) => ({ ...prev, country, currency }))
    setCurrentView("welcome")
  }

  const handleBackToWelcome = () => {
    setCurrentView("welcome")
  }

  const handleBackToDemographics = () => {
    setCurrentView("demographics")
    setUserProfile((prev) => ({ ...prev, country: null, currency: null }))
  }

  const handleResetProfile = () => {
    setUserProfile({ demographic: null, country: null, currency: null })
    localStorage.removeItem("userProfile")
    setCurrentView("demographics")
  }

  const handleViewChange = (
    view:
      | "chat"
      | "budget"
      | "insights"
      | "budget-planner"
      | "investment-tracker"
      | "savings-goals"
      | "tax-optimizer"
      | "financial-education"
      | "debt-manager"
      | "bill-reminder"
      | "lifestyle-mapper",
  ) => {
    if (view === currentView) {
      setCurrentView("welcome")
    } else {
      setCurrentView(view)
    }
  }

  const handleShowBudget = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("budget")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowInsights = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("insights")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleStartChat = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("chat")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowBudgetPlanner = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("budget-planner")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowInvestmentTracker = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("investment-tracker")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowSavingsGoals = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("savings-goals")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowTaxOptimizer = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("tax-optimizer")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowFinancialEducation = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("financial-education")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowDebtManager = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("debt-manager")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowBillReminder = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("bill-reminder")
    } else {
      setCurrentView("demographics")
    }
  }

  const handleShowLifestyleMapper = () => {
    if (userProfile.demographic && userProfile.country) {
      setCurrentView("lifestyle-mapper")
    } else {
      setCurrentView("demographics")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentView === "welcome" && (
        <WelcomeScreen
          userProfile={userProfile}
          onStartChat={handleStartChat}
          onShowBudget={handleShowBudget}
          onShowInsights={handleShowInsights}
          onShowBudgetPlanner={handleShowBudgetPlanner}
          onShowInvestmentTracker={handleShowInvestmentTracker}
          onShowSavingsGoals={handleShowSavingsGoals}
          onShowTaxOptimizer={handleShowTaxOptimizer}
          onShowFinancialEducation={handleShowFinancialEducation}
          onShowDebtManager={handleShowDebtManager}
          onShowBillReminder={handleShowBillReminder}
          onShowLifestyleMapper={handleShowLifestyleMapper}
          onShowDemographics={handleStartDemographics}
          onResetProfile={handleResetProfile}
        />
      )}
      {currentView === "demographics" && (
        <DemographicsSelection onSelectDemographic={handleDemographicSelected} onBack={handleBackToWelcome} />
      )}
      {currentView === "country" && userProfile.demographic && (
        <CountrySelection
          onSelectCountry={handleCountrySelected}
          onBack={handleBackToDemographics}
          userDemographic={userProfile.demographic}
        />
      )}
      {currentView === "chat" && <ChatInterface userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "budget" && <BudgetDashboard userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "insights" && <SpendingInsights userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "budget-planner" && <BudgetPlanner userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "investment-tracker" && (
        <InvestmentTracker userProfile={userProfile} onViewChange={handleViewChange} />
      )}
      {currentView === "savings-goals" && <SavingsGoals userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "tax-optimizer" && <TaxOptimizer userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "financial-education" && (
        <FinancialEducation userProfile={userProfile} onBack={() => setCurrentView("welcome")} />
      )}
      {currentView === "debt-manager" && <DebtManager userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "bill-reminder" && <BillReminder userProfile={userProfile} onViewChange={handleViewChange} />}
      {currentView === "lifestyle-mapper" && (
        <LifestyleFinanceMapper userProfile={userProfile} onViewChange={handleViewChange} />
      )}
    </main>
  )
}
