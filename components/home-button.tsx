"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface HomeButtonProps {
  onGoHome: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function HomeButton({ onGoHome, variant = "outline", size = "default", className = "" }: HomeButtonProps) {
  return (
    <Button onClick={onGoHome} variant={variant} size={size} className={`gap-2 ${className}`}>
      <Home className="h-4 w-4" />
      Home
    </Button>
  )
}
