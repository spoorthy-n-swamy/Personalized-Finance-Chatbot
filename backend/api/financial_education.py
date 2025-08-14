from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from ..services.gemini_service import GeminiService
from ..config import Config

router = APIRouter()
gemini_service = GeminiService()

class CourseRequest(BaseModel):
    userProfile: Dict[str, Any]

class CurriculumRequest(BaseModel):
    userProfile: Dict[str, Any]
    learningGoals: str
    currentLevel: str
    interests: str

class QuizRequest(BaseModel):
    courseId: str
    userProfile: Dict[str, Any]
    topic: Optional[str] = None

@router.post("/courses")
async def get_courses(request: CourseRequest):
    try:
        # Default courses based on user profile
        user_type = request.userProfile.get('userType', 'Student')
        country = request.userProfile.get('country', 'US')
        
        if user_type == 'Student':
            courses = [
                {
                    "id": "budgeting-basics",
                    "title": "Budgeting Basics for Students",
                    "description": "Learn fundamental budgeting skills and money management",
                    "level": "Beginner",
                    "duration": "2 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 8
                },
                {
                    "id": "student-loans",
                    "title": "Understanding Student Loans",
                    "description": "Navigate student loan options and repayment strategies",
                    "level": "Beginner",
                    "duration": "1.5 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 6
                },
                {
                    "id": "investing-101",
                    "title": "Investing 101 for Young Adults",
                    "description": "Start your investment journey with basic concepts",
                    "level": "Beginner",
                    "duration": "3 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 12
                }
            ]
        else:
            courses = [
                {
                    "id": "advanced-investing",
                    "title": "Advanced Investment Strategies",
                    "description": "Portfolio optimization and advanced investment techniques",
                    "level": "Advanced",
                    "duration": "4 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 16
                },
                {
                    "id": "tax-planning",
                    "title": "Professional Tax Planning",
                    "description": "Maximize tax efficiency and understand complex tax strategies",
                    "level": "Intermediate",
                    "duration": "3 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 10
                },
                {
                    "id": "retirement-advanced",
                    "title": "Advanced Retirement Planning",
                    "description": "Comprehensive retirement strategies for professionals",
                    "level": "Advanced",
                    "duration": "5 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 20
                }
            ]
        
        return {"courses": courses}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-curriculum")
async def generate_curriculum(request: CurriculumRequest):
    try:
        user_type = request.userProfile.get('userType', 'Student')
        country = request.userProfile.get('country', 'US')
        currency = request.userProfile.get('currency', 'USD')
        
        prompt = f"""
        Create a personalized financial education curriculum for a {user_type} in {country}.
        
        User Details:
        - Learning Goals: {request.learningGoals}
        - Current Level: {request.currentLevel}
        - Interests: {request.interests}
        - Currency: {currency}
        
        Generate 6-8 relevant courses with:
        - Appropriate difficulty levels
        - Realistic time estimates
        - Engaging descriptions
        - Country-specific considerations
        
        Return as JSON array with fields: id, title, description, level, duration, progress, completed, lessons
        """
        
        response = await gemini_service.generate_content(prompt)
        
        try:
            # Extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            courses_json = response[json_start:json_end]
            courses = json.loads(courses_json)
            
            # Ensure all courses have required fields
            for course in courses:
                course.setdefault('progress', 0)
                course.setdefault('completed', False)
                course.setdefault('lessons', 10)
                
        except (json.JSONDecodeError, ValueError):
            # Fallback to default courses if JSON parsing fails
            courses = [
                {
                    "id": "personalized-budgeting",
                    "title": "Personalized Budgeting Strategy",
                    "description": f"Custom budgeting approach for {user_type.lower()}s",
                    "level": "Beginner" if request.currentLevel == "beginner" else "Intermediate",
                    "duration": "2.5 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 10
                },
                {
                    "id": "goal-based-investing",
                    "title": "Goal-Based Investing",
                    "description": "Investment strategies aligned with your specific goals",
                    "level": "Intermediate",
                    "duration": "3 hours",
                    "progress": 0,
                    "completed": False,
                    "lessons": 12
                }
            ]
        
        return {"courses": courses}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    try:
        user_type = request.userProfile.get('userType', 'Student')
        country = request.userProfile.get('country', 'US')
        topic = request.topic or "general financial literacy"
        
        prompt = f"""
        Create a financial knowledge quiz question for a {user_type} in {country} on the topic: {topic}
        
        Generate a multiple choice question with:
        - 1 clear, practical question
        - 4 answer options (A, B, C, D)
        - 1 correct answer
        - Detailed explanation of why the answer is correct
        
        Make it relevant to their profile and location.
        
        Return as JSON with fields: question, options (array), correctAnswer (index), explanation
        """
        
        response = await gemini_service.generate_content(prompt)
        
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            quiz_json = response[json_start:json_end]
            quiz = json.loads(quiz_json)
            
        except (json.JSONDecodeError, ValueError):
            # Fallback quiz question
            quiz = {
                "question": "What percentage of your income should you ideally save each month?",
                "options": [
                    "5-10%",
                    "20-30%",
                    "50%",
                    "Whatever is left over"
                ],
                "correctAnswer": 1,
                "explanation": "Financial experts recommend saving 20-30% of your income - 20% for long-term goals and 10% for emergencies. This creates a strong foundation for financial security."
            }
        
        return {"quiz": quiz}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
