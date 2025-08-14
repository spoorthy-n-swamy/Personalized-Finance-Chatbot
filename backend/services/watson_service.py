from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from typing import List, Dict, Optional
import logging
from ..config import settings
from ..models.financial_models import DemographicType, UserFinancialProfile

logger = logging.getLogger(__name__)

class WatsonAIService:
    def __init__(self):
        self.authenticator = None
        self.assistant = None
        self.session_id = None
        self._initialize_watson()
    
    def _initialize_watson(self):
        """Initialize Watson Assistant service"""
        try:
            logger.info("Initializing Watson Assistant...")
            
            # Set up authentication
            self.authenticator = IAMAuthenticator(settings.WATSON_API_KEY)
            
            # Initialize Watson Assistant
            self.assistant = AssistantV2(
                version=settings.WATSON_VERSION,
                authenticator=self.authenticator
            )
            
            self.assistant.set_service_url(settings.WATSON_URL)
            
            # Create a session (you'll need to create an assistant first)
            if settings.WATSON_ASSISTANT_ID:
                session_response = self.assistant.create_session(
                    assistant_id=settings.WATSON_ASSISTANT_ID
                ).get_result()
                self.session_id = session_response['session_id']
                logger.info("Watson Assistant initialized successfully")
            else:
                logger.warning("Watson Assistant ID not configured. Please set up your assistant first.")
                
        except Exception as e:
            logger.error(f"Error initializing Watson Assistant: {e}")
            self.assistant = None
    
    def _create_financial_context(
        self, 
        user_profile: UserFinancialProfile,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict:
        """Create context for Watson with user financial profile"""
        
        context = {
            "skills": {
                "main skill": {
                    "user_defined": {
                        "user_profile": {
                            "demographic": user_profile.demographic.value,
                            "age": user_profile.age,
                            "monthly_income": user_profile.monthly_income,
                            "financial_goals": user_profile.financial_goals,
                            "risk_tolerance": user_profile.risk_tolerance
                        }
                    }
                }
            }
        }
        
        return context
    
    async def generate_response(
        self,
        user_message: str,
        user_profile: UserFinancialProfile,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate AI response using Watson Assistant"""
        
        if not self.assistant or not self.session_id:
            return await self._get_fallback_response(user_message, user_profile)
        
        try:
            # Create context with user profile
            context = self._create_financial_context(user_profile, conversation_history)
            
            # Send message to Watson
            logger.info("Sending message to Watson Assistant...")
            response = self.assistant.message(
                assistant_id=settings.WATSON_ASSISTANT_ID,
                session_id=self.session_id,
                input={
                    'message_type': 'text',
                    'text': user_message
                },
                context=context
            ).get_result()
            
            # Extract response text
            if response.get('output', {}).get('generic'):
                watson_response = response['output']['generic'][0].get('text', '')
                if watson_response:
                    logger.info("Watson response generated successfully")
                    return watson_response
            
            # Fallback if no response
            return await self._get_fallback_response(user_message, user_profile)
            
        except Exception as e:
            logger.error(f"Error generating Watson response: {e}")
            return await self._get_fallback_response(user_message, user_profile)
    
    async def _get_fallback_response(self, user_message: str, user_profile: UserFinancialProfile) -> str:
        """Provide fallback responses when Watson is unavailable"""
        
        fallback_responses = {
            DemographicType.STUDENT: {
                "budget": "As a student, I recommend starting with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Even saving $25-50 per month can build a great emergency fund!",
                "savings": "Great question about savings! Start small with a high-yield savings account. Even $1-5 per day adds up to $365-1825 per year. Consider apps like Acorns for micro-investing.",
                "debt": "Student loans can be overwhelming, but you have options! Look into income-driven repayment plans, and always pay more than the minimum when possible to reduce interest.",
                "investment": "As a student, focus on low-cost index funds and ETFs. Start with just $25-50 per month in a diversified portfolio. Time is your biggest advantage!",
                "default": "I'd be happy to help with your financial question! As a student, focus on building good money habits early - budgeting, saving even small amounts, and avoiding unnecessary debt."
            },
            DemographicType.PROFESSIONAL: {
                "investment": "For investment strategies, consider diversifying across index funds, ETFs, and potentially individual stocks based on your risk tolerance. Max out your 401(k) match first - it's free money!",
                "retirement": "Retirement planning is crucial. Aim to save 10-15% of your income. Consider both traditional and Roth IRA options, and don't forget about HSAs as a triple tax-advantaged account.",
                "taxes": "Tax optimization strategies include maximizing retirement contributions, considering tax-loss harvesting, and potentially using tax-advantaged accounts like HSAs and 529 plans.",
                "budget": "As a professional, consider the 50/30/20 rule as a starting point, but aim to increase your savings rate to 20-25% if possible. Automate your savings and investments.",
                "default": "I'm here to help with your financial planning! As a professional, focus on maximizing your earning potential while building wealth through strategic investing and tax optimization."
            }
        }
        
        # Simple keyword matching for fallback
        message_lower = user_message.lower()
        demographic_responses = fallback_responses[user_profile.demographic]
        
        for keyword, response in demographic_responses.items():
            if keyword != "default" and keyword in message_lower:
                return response
        
        return demographic_responses["default"]
    
    def close_session(self):
        """Close Watson session"""
        if self.assistant and self.session_id and settings.WATSON_ASSISTANT_ID:
            try:
                self.assistant.delete_session(
                    assistant_id=settings.WATSON_ASSISTANT_ID,
                    session_id=self.session_id
                )
                logger.info("Watson session closed successfully")
            except Exception as e:
                logger.error(f"Error closing Watson session: {e}")

# Global Watson service instance
watson_service = WatsonAIService()
