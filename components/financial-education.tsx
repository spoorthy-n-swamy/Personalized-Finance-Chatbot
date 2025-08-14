"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HomeButton } from "@/components/home-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Target, Clock, Star, Play, CheckCircle } from "lucide-react"

interface FinancialEducationProps {
  onBack: () => void
  userProfile: any
}

interface Course {
  id: string
  title: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  progress: number
  completed: boolean
  lessons: number
}

interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function FinancialEducation({ onBack, userProfile }: FinancialEducationProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [learningGoals, setLearningGoals] = useState("")
  const [currentLevel, setCurrentLevel] = useState("")
  const [interests, setInterests] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/financial-education/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile }),
      })
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const generatePersonalizedCurriculum = async () => {
    if (!learningGoals.trim() || !currentLevel || !interests.trim()) {
      alert("Please fill in all fields to generate your personalized curriculum")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/financial-education/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          learningGoals: learningGoals.trim(),
          currentLevel,
          interests: interests.trim(),
        }),
      })
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error("Error generating curriculum:", error)
    } finally {
      setLoading(false)
    }
  }

  const startCourse = (course: Course) => {
    setSelectedCourse(course)
  }

  const loadQuiz = async (courseId: string) => {
    try {
      const response = await fetch("/api/financial-education/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, userProfile }),
      })
      const data = await response.json()
      setCurrentQuiz(data.quiz)
      setQuizAnswer(null)
      setShowExplanation(false)
    } catch (error) {
      console.error("Error loading quiz:", error)
    }
  }

  const submitQuizAnswer = () => {
    if (quizAnswer !== null) {
      setShowExplanation(true)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Financial Education</h1>
              <p className="text-sm text-gray-500">Learn and grow your financial knowledge</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userProfile && (
              <>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
                  🎓 {userProfile.userType || "Student"}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-600">
                  🌍 {userProfile.country || "Location"} ({userProfile.currency || "USD"})
                </Badge>
              </>
            )}
            <HomeButton onGoHome={onBack} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curriculum">My Curriculum</TabsTrigger>
            <TabsTrigger value="courses">Available Courses</TabsTrigger>
            <TabsTrigger value="quiz">Practice Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Create Your Personalized Learning Path
                </CardTitle>
                <CardDescription>
                  Tell us about your financial learning goals to get a customized curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goals">What are your financial learning goals?</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., I want to learn about investing, understand budgeting better, prepare for retirement..."
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">What's your current financial knowledge level?</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">Advanced - Experienced investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">What financial topics interest you most?</Label>
                  <Textarea
                    id="interests"
                    placeholder="e.g., stocks, real estate, cryptocurrency, budgeting, taxes, retirement planning..."
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button onClick={generatePersonalizedCurriculum} disabled={loading} className="w-full">
                  {loading ? "Generating Your Curriculum..." : "Generate My Personalized Curriculum"}
                </Button>
              </CardContent>
            </Card>

            {courses.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{course.lessons} lessons</span>
                          <Button
                            size="sm"
                            onClick={() => startCourse(course)}
                            variant={course.completed ? "outline" : "default"}
                          >
                            {course.completed ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                {course.progress > 0 ? "Continue" : "Start"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Courses</CardTitle>
                <CardDescription>Browse our comprehensive library of financial education courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Create your personalized curriculum first to see recommended courses
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {course.duration}
                            </div>
                          </div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button onClick={() => startCourse(course)} className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Start Course
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Financial Knowledge Quiz
                </CardTitle>
                <CardDescription>Test your financial knowledge with personalized questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentQuiz ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-topic">What topic would you like to be quizzed on?</Label>
                      <Input id="quiz-topic" placeholder="e.g., budgeting, investing, retirement planning, taxes..." />
                    </div>
                    <Button onClick={() => loadQuiz("general")} className="w-full">
                      Generate Quiz Questions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{currentQuiz.question}</h3>
                      <div className="space-y-2">
                        {currentQuiz.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={quizAnswer === index ? "default" : "outline"}
                            className="w-full text-left justify-start"
                            onClick={() => setQuizAnswer(index)}
                          >
                            {String.fromCharCode(65 + index)}. {option}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {!showExplanation ? (
                      <Button onClick={submitQuizAnswer} disabled={quizAnswer === null} className="w-full">
                        Submit Answer
                      </Button>
                    ) : (
                      <Card
                        className={
                          quizAnswer === currentQuiz.correctAnswer
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {quizAnswer === currentQuiz.correctAnswer ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-800">Correct!</span>
                              </>
                            ) : (
                              <>
                                <Star className="h-5 w-5 text-red-600" />
                                <span className="font-semibold text-red-800">
                                  Incorrect. The correct answer is {String.fromCharCode(65 + currentQuiz.correctAnswer)}
                                  .
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-700">{currentQuiz.explanation}</p>
                          <Button onClick={() => loadQuiz("general")} className="mt-4 w-full">
                            Next Question
                          </Button>
                        </CardContent>
                      </Card>
                    )}
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
