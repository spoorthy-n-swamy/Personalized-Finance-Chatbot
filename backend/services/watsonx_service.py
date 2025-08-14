import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from backend.config import settings

logger = logging.getLogger(__name__)

class WatsonxService:
    def __init__(self):
        self.api_key = getattr(settings, 'WATSONX_API_KEY', None)
        self.api_url = getattr(settings, 'WATSONX_API_URL', None)
        self.region = getattr(settings, 'WATSONX_REGION', 'us-south')  # Default region
        self.model = getattr(settings, 'WATSONX_MODEL', 'ibm/granite-13b-chat-v2')  # Default model
        self.project_id = getattr(settings, 'WATSONX_PROJECT_ID', None)
        self.access_token = None
        self.token_expires_at = None
        self.token_url = "https://iam.cloud.ibm.com/identity/token"
        
        if self._is_configured():
            logger.info("Watsonx service initialized with valid configuration")
        else:
            logger.warning("Watsonx service initialized but missing configuration. Set WATSONX_API_KEY environment variable.")
    
    def _is_configured(self) -> bool:
        """Check if Watsonx is properly configured"""
        return bool(self.api_key)
    
    async def _fetch_access_token(self) -> str:
        """Fetch access token from IBM Cloud IAM"""
        try:
            if not self.api_key:
                raise Exception("WATSONX_API_KEY not configured")
                
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            data = f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={self.api_key}"
            
            logger.info("Requesting access token from IBM Cloud IAM...")
            response = requests.post(self.token_url, headers=headers, data=data, timeout=30)
            
            if response.status_code != 200:
                logger.error(f"Token request failed with status {response.status_code}: {response.text}")
                raise Exception(f"Token request failed: {response.status_code} - {response.text}")
            
            token_data = response.json()
            
            if "access_token" not in token_data:
                logger.error(f"No access_token in response: {token_data}")
                raise Exception("No access_token in IAM response")
                
            self.access_token = token_data["access_token"]
            
            # Calculate expiration time (tokens typically last 1 hour)
            expires_in = token_data.get("expires_in", 3600)  # Default 1 hour
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)  # Refresh 5 min early
            
            logger.info("Successfully fetched Watsonx access token")
            return self.access_token
            
        except Exception as e:
            logger.error(f"Error fetching Watsonx access token: {e}")
            raise Exception(f"Failed to authenticate with Watsonx: {str(e)}")
    
    async def _ensure_valid_token(self) -> str:
        """Ensure we have a valid access token, refresh if needed"""
        if not self.access_token or not self.token_expires_at or datetime.now() >= self.token_expires_at:
            return await self._fetch_access_token()
        return self.access_token
    
    async def generate_financial_advice(self, query: str, user_context: Dict[str, Any]) -> str:
        """Generate financial advice using Watsonx API with auto token management"""
        try:
            # Check if Watsonx is properly configured
            if not self._is_configured():
                logger.warning("Watsonx not fully configured, using fallback response")
                return await self._get_fallback_response(query, user_context)
            
            try:
                # Ensure we have a valid token
                token = await self._ensure_valid_token()
                
                api_endpoint = self._build_api_endpoint()
                
                request_body = self._build_request_body(query, user_context)
                
                # Call Watsonx API
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                logger.info(f"Making request to Watsonx API: {api_endpoint}")
                
                response = requests.post(api_endpoint, headers=headers, json=request_body, timeout=60)
                
                if response.status_code == 401:
                    logger.warning("Authentication failed, attempting token refresh...")
                    # Clear token and retry once
                    self.access_token = None
                    self.token_expires_at = None
                    
                    try:
                        token = await self._ensure_valid_token()
                        headers["Authorization"] = f"Bearer {token}"
                        response = requests.post(api_endpoint, headers=headers, json=request_body, timeout=60)
                    except Exception as retry_error:
                        logger.error(f"Token refresh failed: {retry_error}")
                        return await self._get_fallback_response(query, user_context)
                
                if response.status_code != 200:
                    logger.error(f"Watsonx API error: {response.status_code} - {response.text}")
                    return await self._get_fallback_response(query, user_context)
                
                result = response.json()
                
                if "output_text" in result:
                    generated_text = result["output_text"]
                    if generated_text and len(generated_text.strip()) > 10:
                        logger.info("Successfully generated response from Watsonx")
                        return generated_text.strip()
                
                # Fallback if no valid response
                logger.warning("No valid response from Watsonx, using fallback")
                return await self._get_fallback_response(query, user_context)
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Network error calling Watsonx API: {e}")
                return await self._get_fallback_response(query, user_context)
            except Exception as e:
                logger.error(f"Unexpected error calling Watsonx API: {e}")
                return await self._get_fallback_response(query, user_context)
            
        except Exception as e:
            logger.error(f"Error in generate_financial_advice: {e}")
            return await self._get_fallback_response(query, user_context)
    
    def _build_api_endpoint(self) -> str:
        """Build the correct API endpoint URL using new format"""
        return f"https://api.{self.region}.watsonx.ai/v1/generation/{self.model}/text"
    
    def _build_request_body(self, query: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Build the request body for Watsonx API using new format"""
        return {
            "input": self._build_financial_prompt(query, user_context),
            "max_tokens": 200,
            "temperature": 0.7,
            "top_p": 0.9
        }
    
    def _build_financial_prompt(self, query: str, user_context: Dict[str, Any]) -> str:
        """Build a comprehensive financial advice prompt for Watsonx"""
        user_type = user_context.get('userType', 'user')
        country = user_context.get('country', 'their location')
        age = user_context.get('age', 'not specified')
        income = user_context.get('income', 'not specified')
        
        prompt = f"""You are a professional financial advisor providing personalized advice.

User Profile:
- Type: {user_type}
- Age: {age}
- Income Level: {income}
- Location: {country}

User Question: {query}

Please provide specific, actionable financial advice that is:
1. Tailored to their profile and location
2. Practical and implementable
3. Appropriate for their experience level
4. Based on sound financial principles

Focus on concrete steps they can take. Be encouraging but realistic.

Response:"""
        
        return prompt
    
    async def _get_fallback_response(self, query: str, user_context: Dict[str, Any]) -> str:
        """Provide fallback responses when Watsonx is unavailable"""
        user_type = user_context.get('userType', 'user')
        
        fallback_responses = {
            "student": {
                "budget": "As a student, I recommend starting with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Even saving $25-50 per month can build a great emergency fund! Consider using budgeting apps to track your spending.",
                "savings": "Great question about savings! Start small with a high-yield savings account. Even $1-5 per day adds up to $365-1825 per year. Consider apps like Acorns for micro-investing, and look into student-specific savings accounts with no fees.",
                "debt": "Student loans can be overwhelming, but you have options! Look into income-driven repayment plans, and always pay more than the minimum when possible to reduce interest. Consider refinancing if you have good credit.",
                "investment": "As a student, focus on low-cost index funds and ETFs. Start with just $25-50 per month in a diversified portfolio. Time is your biggest advantage! Consider opening a Roth IRA for tax-free growth.",
                "default": "I'd be happy to help with your financial question! As a student, focus on building good money habits early - budgeting, saving even small amounts, and avoiding unnecessary debt. Every small step counts toward your financial future."
            },
            "professional": {
                "investment": "For investment strategies, consider diversifying across index funds, ETFs, and potentially individual stocks based on your risk tolerance. Max out your 401(k) match first - it's free money! Consider target-date funds for simplicity.",
                "retirement": "Retirement planning is crucial. Aim to save 10-15% of your income. Consider both traditional and Roth IRA options, and don't forget about HSAs as a triple tax-advantaged account. Start early to benefit from compound growth.",
                "taxes": "Tax optimization strategies include maximizing retirement contributions, considering tax-loss harvesting, and potentially using tax-advantaged accounts like HSAs and 529 plans. Consult with a tax professional for personalized advice.",
                "budget": "As a professional, consider the 50/30/20 rule as a starting point, but aim to increase your savings rate to 20-25% if possible. Automate your savings and investments to make it effortless.",
                "default": "I'm here to help with your financial planning! As a professional, focus on maximizing your earning potential while building wealth through strategic investing and tax optimization. Consider working with a financial advisor for complex situations."
            }
        }
        
        # Simple keyword matching for fallback
        query_lower = query.lower()
        responses = fallback_responses.get(user_type, fallback_responses["professional"])
        
        for keyword, response in responses.items():
            if keyword != "default" and keyword in query_lower:
                return response
        
        return responses["default"]

# Global Watsonx service instance
watsonx_service = WatsonxService()
