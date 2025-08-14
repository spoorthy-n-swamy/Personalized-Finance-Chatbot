"use client"
import { useState } from "react"
import type React from "react"
import { HomeButton } from "@/components/home-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, User, GraduationCap, Briefcase, Send, Loader2, Globe } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface UserProfile {
  demographic: "student" | "professional" | null
  country: string | null
  currency: string | null
}

interface ChatInterfaceProps {
  userProfile: UserProfile
  onViewChange: (view: "chat" | "budget" | "insights" | "welcome") => void
}

export function ChatInterface({ userProfile, onViewChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm your AI financial advisor powered by IBM Watson & Granite AI. I'm here to help you with personalized financial guidance${userProfile.demographic ? ` tailored for ${userProfile.demographic}s` : ""}${userProfile.country ? ` in ${userProfile.country}` : ""}${userProfile.currency ? ` using ${userProfile.currency}` : ""}. What would you like to know about your finances today?`,
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userProfile: userProfile,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.content || "I apologize, but I'm having trouble processing your request right now. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having technical difficulties. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGoHome = () => {
    onViewChange("welcome")
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Chat Assistant</h1>
              <p className="text-sm text-slate-600">Powered by IBM Watson & Granite AI</p>
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
            <HomeButton onGoHome={handleGoHome} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="bg-primary/10 p-2 rounded-full h-fit">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === "user" ? "bg-primary text-white" : "bg-white text-slate-900 border border-slate-200"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mb-3 mt-0">{children}</h1>,
                      h2: ({ children }) => (
                        <h2 className="text-base font-semibold text-slate-800 mb-2 mt-4 first:mt-0">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-medium text-slate-700 mb-2 mt-3">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm leading-relaxed text-slate-900 mb-3 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 mb-3 text-sm">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 mb-3 text-sm">{children}</ol>
                      ),
                      li: ({ children }) => <li className="text-slate-900 leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-2 bg-slate-50 rounded-r-lg mb-3">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
              <p
                className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-slate-500"}`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {message.role === "user" && (
              <div className="bg-primary/10 p-2 rounded-full h-fit">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-primary/10 p-2 rounded-full h-fit">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-slate-600">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Panel */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about budgeting, investments, savings, or any financial question..."
              className="min-h-[48px] resize-none border-slate-300 focus:border-primary"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className="h-12 px-6 gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
