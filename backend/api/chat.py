from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging
from datetime import datetime

from ..models.financial_models import UserFinancialProfile, DemographicType
from ..services.ai_service import ai_service
from ..services.watsonx_service import watsonx_service
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = None

class ChatRequest(BaseModel):
    message: str
    user_profile: UserFinancialProfile
    conversation_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    message: str
    action_items: List[str] = []
    key_insights: List[Dict[str, str]] = []
    tone: str
    follow_up_suggestions: List[str] = []
    timestamp: datetime
    user_profile: UserFinancialProfile

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the AI and get a personalized financial guidance response
    
    This endpoint delivers:
    - Personalized Financial Guidance based on user profile
    - Demographic-Aware Communication (student vs professional)
    - Conversational NLP Experience using IBM Granite AI
    - Structured, actionable responses with clear formatting
    """
    try:
        logger.info(f"Processing chat message for user: {request.user_profile.user_id}")
        
        # Convert conversation history to dict format
        history = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.conversation_history
        ]
        
        structured_response = await ai_service.generate_response(
            user_message=request.message,
            user_profile=request.user_profile,
            conversation_history=history
        )
        
        return ChatResponse(
            message=structured_response["message"],
            action_items=structured_response.get("action_items", []),
            key_insights=structured_response.get("key_insights", []),
            tone=structured_response.get("tone", "professional"),
            follow_up_suggestions=structured_response.get("follow_up_suggestions", []),
            timestamp=datetime.now(),
            user_profile=request.user_profile
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail="Error processing your message")

@router.post("/financial-advice")
async def get_financial_advice(request: ChatRequest):
    """
    Get specific financial advice based on user query and profile
    
    Provides targeted guidance on:
    - Savings strategies
    - Investment recommendations  
    - Tax optimization
    - Budget planning
    """
    try:
        # Add financial context to the message
        enhanced_message = f"""
        Please provide specific financial advice for the following query: {request.message}
        
        Focus on actionable recommendations and practical steps.
        """
        
        structured_advice = await ai_service.generate_response(
            user_message=enhanced_message,
            user_profile=request.user_profile,
            conversation_history=[msg.dict() for msg in request.conversation_history]
        )
        
        return {
            "advice": structured_advice["message"],
            "action_items": structured_advice.get("action_items", []),
            "key_insights": structured_advice.get("key_insights", []),
            "follow_up_suggestions": structured_advice.get("follow_up_suggestions", []),
            "category": "financial_guidance",
            "timestamp": datetime.now(),
            "demographic": request.user_profile.demographic,
            "tone": structured_advice.get("tone", "professional")
        }
        
    except Exception as e:
        logger.error(f"Error generating financial advice: {e}")
        raise HTTPException(status_code=500, detail="Error generating financial advice")

@router.get("/conversation-starters/{demographic}")
async def get_conversation_starters(demographic: DemographicType):
    """Get demographic-specific conversation starters"""
    
    starters = {
        DemographicType.STUDENT: [
            "How can I start building an emergency fund with limited income?",
            "What's the best way to manage student loan debt?",
            "How much should I save each month as a student?",
            "What are some good budgeting apps for students?",
            "Should I start investing while in college?"
        ],
        DemographicType.PROFESSIONAL: [
            "How can I optimize my 401(k) contributions?",
            "What investment strategies work best for my age group?",
            "How can I reduce my tax burden legally?",
            "Should I prioritize paying off debt or investing?",
            "What's the best way to plan for early retirement?"
        ]
    }
    
    return {
        "starters": starters[demographic],
        "demographic": demographic
    }

@router.get("/quick-tips/{demographic}")
async def get_quick_tips(demographic: DemographicType):
    """Get quick, actionable financial tips based on demographic"""
    
    tips = {
        DemographicType.STUDENT: [
            {
                "title": "Start Small, Think Big",
                "tip": "Save just $1-5 per day. It adds up to $365-1825 per year!",
                "action": "Set up automatic transfers to savings"
            },
            {
                "title": "Track Every Dollar",
                "tip": "Use free apps like Mint or YNAB to monitor spending habits",
                "action": "Download a budgeting app this week"
            },
            {
                "title": "Build Credit Wisely",
                "tip": "Get a student credit card and pay it off monthly",
                "action": "Research student credit card options"
            }
        ],
        DemographicType.PROFESSIONAL: [
            {
                "title": "Maximize Free Money",
                "tip": "Contribute enough to get full 401(k) employer match",
                "action": "Check your current contribution rate"
            },
            {
                "title": "Automate Wealth Building",
                "tip": "Set up automatic investments in low-cost index funds",
                "action": "Increase investment contributions by 1%"
            },
            {
                "title": "Tax-Advantaged Accounts",
                "tip": "Max out HSA contributions - triple tax advantage",
                "action": "Review HSA contribution limits for this year"
            }
        ]
    }
    
    return {
        "tips": tips[demographic],
        "demographic": demographic,
        "updated": datetime.now()
    }

@router.post("/watsonx-direct")
async def get_watsonx_response(request: ChatRequest):
    """
    Get direct response from Watsonx AI with auto token management
    
    This endpoint provides:
    - Direct access to IBM Watsonx Granite models
    - Automatic token refresh and management
    - Financial advice optimized prompting
    """
    try:
        logger.info(f"Processing direct Watsonx request for user: {request.user_profile.user_id}")
        
        user_context = {
            "userType": request.user_profile.demographic.value,
            "country": getattr(request.user_profile, 'country', 'US'),
            "age": request.user_profile.age,
            "income": request.user_profile.monthly_income * 12 if request.user_profile.monthly_income else "not specified"
        }
        
        watsonx_response = await watsonx_service.generate_financial_advice(
            request.message, user_context
        )
        
        return {
            "message": watsonx_response,
            "service": "watsonx",
            "timestamp": datetime.now(),
            "user_profile": request.user_profile
        }
        
    except Exception as e:
        logger.error(f"Error processing Watsonx request: {e}")
        raise HTTPException(status_code=500, detail="Error processing Watsonx request")
