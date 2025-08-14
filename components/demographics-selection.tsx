"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Briefcase, ArrowLeft } from "lucide-react"

interface DemographicsSelectionProps {
  onSelectDemographic: (demographic: "student" | "professional") => void
  onBack: () => void
}

export function DemographicsSelection({ onSelectDemographic, onBack }: DemographicsSelectionProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Tell us about yourself</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Help us personalize your financial guidance by selecting the option that best describes your current
          situation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card
          className="border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onSelectDemographic("student")}
        >
          <CardHeader className="text-center pb-4">
            <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Student</CardTitle>
            <CardDescription className="text-base">
              Currently in school or recently graduated, focusing on building financial foundations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Budget-friendly advice and strategies</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Student loan management guidance</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Entry-level investment options</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Building credit and emergency funds</span>
              </div>
            </div>
            <Button
              className="w-full mt-6 bg-primary hover:bg-primary/90"
              onClick={() => onSelectDemographic("student")}
            >
              I'm a Student
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onSelectDemographic("professional")}
        >
          <CardHeader className="text-center pb-4">
            <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Professional</CardTitle>
            <CardDescription className="text-base">
              Working professional looking to optimize finances and build wealth
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Advanced investment strategies</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Tax optimization and planning</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Retirement and wealth building</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Portfolio diversification</span>
              </div>
            </div>
            <Button
              className="w-full mt-6 bg-primary hover:bg-primary/90"
              onClick={() => onSelectDemographic("professional")}
            >
              I'm a Professional
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-slate-500">Don't worry, you can always adjust your preferences later in the chat.</p>
      </div>
    </div>
  )
}
