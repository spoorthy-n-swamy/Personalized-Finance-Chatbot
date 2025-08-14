from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
from typing import List, Dict, Optional
import logging
import os
from ..config import settings
from ..models.financial_models import DemographicType, UserFinancialProfile
from .watson_service import watson_service
from .watsonx_service import watsonx_service
from .response_formatter import response_formatter

logger = logging.getLogger(__name__)

class GraniteAIService:
    def __init__(self):
        self.model_name = "ibm-granite/granite-3.1-2b-instruct"
        self.pipeline = None
        self.hf_api_key = "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"
        self.use_watsonx = False  # Disable Watsonx to prioritize transformers pipeline
        self.use_watson = False   # Disable Watson to prioritize transformers pipeline
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the Granite 3.1 2B Instruct model using transformers pipeline with API key"""
        try:
            logger.info(f"Loading Granite model: {self.model_name}")
            
            os.environ["HUGGINGFACE_HUB_TOKEN"] = self.hf_api_key
            
            self.pipeline = pipeline(
                "text-generation", 
                model=self.model_name,
                token=self.hf_api_key,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None,
                max_new_tokens=getattr(settings, 'MAX_TOKENS', 512),
                temperature=getattr(settings, 'TEMPERATURE', 0.7),
                do_sample=True,
                pad_token_id=50256  # Standard GPT-style pad token
            )
            
            logger.info("Granite 3.1 2B Instruct model loaded successfully with transformers pipeline and API key")
            
        except Exception as e:
            logger.error(f"Error loading Granite model: {e}")
            # Fallback to a smaller model if Granite fails
            self._initialize_fallback_model()
    
    def _initialize_fallback_model(self):
        """Initialize a fallback model if Granite fails to load"""
        try:
            logger.info("Loading fallback model...")
            self.pipeline = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                token=self.hf_api_key,
                max_new_tokens=getattr(settings, 'MAX_TOKENS', 512),
                temperature=getattr(settings, 'TEMPERATURE', 0.7)
            )
            logger.info("Fallback model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading fallback model: {e}")
            self.pipeline = None
    
    def _create_financial_prompt(
        self, 
        user_message: str, 
        user_profile: UserFinancialProfile,
        conversation_history: List[Dict[str, str]] = None
    ) -> List[Dict[str, str]]:
        """Create messages format for Granite 3.1 2B Instruct model"""
        
        messages = []
        
        # System message for financial guidance
        system_content = """You are a knowledgeable personal finance advisor powered by IBM's Granite AI technology. 
You provide personalized financial guidance on savings, taxes, and investments. Always give practical, 
actionable advice while being encouraging and supportive."""
        
        # Demographic-specific prompting
        if user_profile.demographic == DemographicType.STUDENT:
            system_content += """

Your user is a student. Tailor your advice to:
- Budget-friendly solutions and cost-saving strategies
- Building financial foundations and good habits
- Student-specific financial challenges (loans, part-time income)
- Simple, easy-to-understand explanations
- Focus on emergency funds and avoiding debt
- Use encouraging, supportive tone with practical examples"""
        else:  # PROFESSIONAL
            system_content += """

Your user is a working professional. Tailor your advice to:
- Advanced investment strategies and wealth building
- Tax optimization and retirement planning
- Professional financial goals (home buying, career growth)
- Detailed analysis with specific numbers and strategies
- Focus on maximizing returns and long-term wealth
- Use confident, analytical tone with sophisticated recommendations"""
        
        # Add user context
        system_content += f"""

User Profile:
- Age: {user_profile.age or 'Not specified'}
- Monthly Income: ${user_profile.monthly_income:,.2f}
- Financial Goals: {', '.join(user_profile.financial_goals) if user_profile.financial_goals else 'Not specified'}
- Risk Tolerance: {user_profile.risk_tolerance}"""
        
        messages.append({"role": "system", "content": system_content})
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-3:]:  # Last 3 messages for context
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    async def generate_response(
        self,
        user_message: str,
        user_profile: UserFinancialProfile,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, any]:
        """Generate AI response using Granite 3.1 2B Instruct model with transformers pipeline"""
        
        raw_response = await self._generate_granite_response(user_message, user_profile, conversation_history)
        
        # Only fallback to other services if Granite completely fails
        if not raw_response or len(raw_response.strip()) < 10:
            if self.use_watsonx and settings.WATSONX_API_KEY and settings.WATSONX_API_URL:
                try:
                    user_context = {
                        "userType": user_profile.demographic.value,
                        "country": getattr(user_profile, 'country', 'US'),
                        "age": user_profile.age,
                        "income": user_profile.monthly_income * 12 if user_profile.monthly_income else "not specified"
                    }
                    
                    watsonx_response = await watsonx_service.generate_financial_advice(
                        user_message, user_context
                    )
                    if watsonx_response and len(watsonx_response.strip()) > 10:
                        logger.info("Using Watsonx response as fallback")
                        raw_response = watsonx_response
                except Exception as e:
                    logger.warning(f"Watsonx fallback failed: {e}")
            
            # Final fallback to Watson if still no response
            if not raw_response and self.use_watson and watson_service.assistant:
                try:
                    watson_response = await watson_service.generate_response(
                        user_message, user_profile, conversation_history
                    )
                    if watson_response and len(watson_response.strip()) > 10:
                        logger.info("Using Watson Assistant as final fallback")
                        raw_response = watson_response
                except Exception as e:
                    logger.warning(f"Watson fallback failed: {e}")
        
        if not raw_response or len(raw_response.strip()) < 10:
            raw_response = self._get_fallback_response(user_message, user_profile)
        
        formatted_response = response_formatter.format_financial_response(
            raw_response, user_profile, user_message
        )
        
        return formatted_response
    
    async def _generate_granite_response(
        self,
        user_message: str,
        user_profile: UserFinancialProfile,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate response using Granite 3.1 2B Instruct model with transformers pipeline"""
        
        if not self.pipeline:
            return self._get_fallback_response(user_message, user_profile)
        
        try:
            messages = self._create_financial_prompt(user_message, user_profile, conversation_history)
            
            # Generate response using the pipeline
            logger.info("Generating AI response with Granite 3.1 2B Instruct model...")
            
            response = self.pipeline(messages)
            
            # Extract the generated text
            if isinstance(response, list) and len(response) > 0:
                generated_text = response[0].get('generated_text', '')
                
                # If the response contains the full conversation, extract just the assistant's response
                if isinstance(generated_text, list):
                    # Find the last assistant message
                    for msg in reversed(generated_text):
                        if msg.get('role') == 'assistant':
                            ai_response = msg.get('content', '').strip()
                            break
                    else:
                        ai_response = str(generated_text[-1]) if generated_text else ""
                else:
                    ai_response = generated_text.strip()
            else:
                ai_response = ""
            
            # Ensure response is not empty
            if not ai_response:
                ai_response = self._get_fallback_response(user_message, user_profile)
            
            logger.info("AI response generated successfully with Granite 3.1 2B Instruct")
            return ai_response
            
        except Exception as e:
            logger.error(f"Error generating AI response with Granite: {e}")
            return self._get_fallback_response(user_message, user_profile)
    
    def _get_fallback_response(self, user_message: str, user_profile: UserFinancialProfile) -> str:
        """Provide fallback responses when AI generation fails"""
        
        fallback_responses = {
            DemographicType.STUDENT: {
                "budget": "As a student, I recommend starting with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Even saving $25-50 per month can build a great emergency fund!",
                "savings": "Great question about savings! Start small with a high-yield savings account. Even $1-5 per day adds up to $365-1825 per year. Consider apps like Acorns for micro-investing.",
                "debt": "Student loans can be overwhelming, but you have options! Look into income-driven repayment plans, and always pay more than the minimum when possible to reduce interest.",
                "default": "I'd be happy to help with your financial question! As a student, focus on building good money habits early - budgeting, saving even small amounts, and avoiding unnecessary debt."
            },
            DemographicType.PROFESSIONAL: {
                "investment": "For investment strategies, consider diversifying across index funds, ETFs, and potentially individual stocks based on your risk tolerance. Max out your 401(k) match first - it's free money!",
                "retirement": "Retirement planning is crucial. Aim to save 10-15% of your income. Consider both traditional and Roth IRA options, and don't forget about HSAs as a triple tax-advantaged account.",
                "taxes": "Tax optimization strategies include maximizing retirement contributions, considering tax-loss harvesting, and potentially using tax-advantaged accounts like HSAs and 529 plans.",
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

# Global AI service instance
ai_service = GraniteAIService()
