from typing import Dict, List, Optional
import re
from ..models.financial_models import DemographicType, UserFinancialProfile

class ResponseFormatter:
    """Format and structure AI responses for better clarity and readability"""
    
    @staticmethod
    def format_financial_response(
        raw_response: str, 
        user_profile: UserFinancialProfile,
        user_message: str
    ) -> Dict[str, any]:
        """Format AI response into structured, clear format"""
        
        # Clean and structure the response
        cleaned_response = ResponseFormatter._clean_response(raw_response)
        
        # Extract key components
        main_advice = ResponseFormatter._extract_main_advice(cleaned_response)
        action_items = ResponseFormatter._extract_action_items(cleaned_response)
        key_numbers = ResponseFormatter._extract_key_numbers(cleaned_response)
        
        formatted_response = {
            "message": ResponseFormatter._format_main_message(main_advice, user_profile),
            "sections": ResponseFormatter._create_structured_sections(cleaned_response),
            "action_items": action_items,
            "key_insights": key_numbers,
            "tone": ResponseFormatter._get_appropriate_tone(user_profile),
            "follow_up_suggestions": ResponseFormatter._generate_follow_ups(user_message, user_profile),
            "formatted_text": ResponseFormatter._create_readable_format(cleaned_response, action_items, key_numbers)
        }
        
        return formatted_response
    
    @staticmethod
    def _clean_response(response: str) -> str:
        """Clean up the raw AI response"""
        # Remove extra whitespace and line breaks
        cleaned = re.sub(r'\n\s*\n', '\n\n', response.strip())
        
        # Remove any prompt artifacts
        cleaned = re.sub(r'^(Assistant:|AI:|Bot:)\s*', '', cleaned, flags=re.IGNORECASE)
        
        # Ensure proper sentence structure
        sentences = cleaned.split('. ')
        cleaned_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not sentence.endswith('.') and not sentence.endswith('!') and not sentence.endswith('?'):
                sentence += '.'
            if sentence:
                cleaned_sentences.append(sentence)
        
        return ' '.join(cleaned_sentences)
    
    @staticmethod
    def _extract_main_advice(response: str) -> str:
        """Extract the main advice from the response"""
        # Split into paragraphs and take the most substantial one
        paragraphs = [p.strip() for p in response.split('\n\n') if p.strip()]
        
        if not paragraphs:
            return response
        
        # Find the paragraph with the most financial keywords
        financial_keywords = [
            'save', 'invest', 'budget', 'money', 'financial', 'income', 'expense',
            'retirement', 'emergency fund', 'debt', 'credit', 'loan', 'interest'
        ]
        
        best_paragraph = paragraphs[0]
        max_keywords = 0
        
        for paragraph in paragraphs:
            keyword_count = sum(1 for keyword in financial_keywords if keyword.lower() in paragraph.lower())
            if keyword_count > max_keywords:
                max_keywords = keyword_count
                best_paragraph = paragraph
        
        return best_paragraph
    
    @staticmethod
    def _extract_action_items(response: str) -> List[str]:
        """Extract actionable items from the response"""
        action_items = []
        
        # Look for numbered lists, bullet points, or action verbs
        action_patterns = [
            r'(?:^|\n)\s*(?:\d+\.|\*|-|\•)\s*(.+?)(?=\n|$)',
            r'(?:Start|Begin|Consider|Try|Look into|Set up|Open|Create|Build|Establish)\s+([^.!?]+[.!?])',
            r'(?:You should|I recommend|I suggest)\s+([^.!?]+[.!?])'
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, response, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match[0] else match[1]
                
                action = match.strip()
                if len(action) > 10 and action not in action_items:
                    action_items.append(action)
        
        return action_items[:3]  # Limit to top 3 action items
    
    @staticmethod
    def _extract_key_numbers(response: str) -> List[Dict[str, str]]:
        """Extract key financial numbers and percentages"""
        key_numbers = []
        
        # Pattern for percentages and dollar amounts with context
        number_patterns = [
            r'(\$[\d,]+(?:\.\d{2})?)\s*([^.!?]*)',
            r'(\d+(?:\.\d+)?%)\s*([^.!?]*)',
            r'(\d+(?::\d+)?(?:\s*rule)?)\s*([^.!?]*)'
        ]
        
        for pattern in number_patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            for number, context in matches:
                if len(context.strip()) > 5:  # Ensure meaningful context
                    key_numbers.append({
                        "value": number,
                        "context": context.strip()[:100]  # Limit context length
                    })
        
        return key_numbers[:3]  # Limit to top 3 key numbers
    
    @staticmethod
    def _get_appropriate_tone(user_profile: UserFinancialProfile) -> str:
        """Determine appropriate tone based on user profile"""
        if user_profile.demographic == DemographicType.STUDENT:
            return "encouraging_supportive"
        else:
            return "professional_analytical"
    
    @staticmethod
    def _generate_follow_ups(user_message: str, user_profile: UserFinancialProfile) -> List[str]:
        """Generate relevant follow-up questions"""
        message_lower = user_message.lower()
        
        if user_profile.demographic == DemographicType.STUDENT:
            follow_ups = {
                "budget": [
                    "Would you like help creating a monthly budget plan?",
                    "Do you want tips on tracking your expenses?",
                    "Should we discuss building an emergency fund?"
                ],
                "save": [
                    "What's your current savings goal?",
                    "Would you like to know about high-yield savings accounts?",
                    "Should we talk about automating your savings?"
                ],
                "invest": [
                    "Are you interested in learning about index funds?",
                    "Would you like to know about student-friendly investment apps?",
                    "Should we discuss your risk tolerance?"
                ]
            }
        else:
            follow_ups = {
                "invest": [
                    "Would you like a detailed investment portfolio analysis?",
                    "Should we discuss tax-advantaged investment strategies?",
                    "Are you interested in retirement planning optimization?"
                ],
                "retire": [
                    "Would you like to calculate your retirement savings needs?",
                    "Should we discuss 401(k) vs Roth IRA strategies?",
                    "Are you interested in catch-up contribution strategies?"
                ],
                "tax": [
                    "Would you like help with tax optimization strategies?",
                    "Should we discuss tax-loss harvesting?",
                    "Are you interested in HSA tax advantages?"
                ]
            }
        
        # Find relevant follow-ups based on message content
        for keyword, questions in follow_ups.items():
            if keyword in message_lower:
                return questions[:2]  # Return top 2 relevant questions
        
        # Default follow-ups
        if user_profile.demographic == DemographicType.STUDENT:
            return [
                "Would you like help with budgeting basics?",
                "Should we discuss building good financial habits?"
            ]
        else:
            return [
                "Would you like a comprehensive financial plan review?",
                "Should we discuss advanced wealth-building strategies?"
            ]
    
    @staticmethod
    def _create_readable_format(response: str, action_items: List[str], key_numbers: List[Dict]) -> str:
        """Create a beautifully formatted, readable response"""
        sections = []
        
        # Split response into logical sections
        paragraphs = [p.strip() for p in response.split('\n') if p.strip()]
        
        current_section = []
        section_title = None
        
        for paragraph in paragraphs:
            # Check if this looks like a section header
            if (paragraph.endswith(':') or 
                any(keyword in paragraph.lower() for keyword in ['getting started', 'priorities', 'options', 'advantage', 'tips', 'steps'])):
                
                # Save previous section
                if current_section:
                    sections.append({
                        'title': section_title or 'Financial Advice',
                        'content': current_section
                    })
                
                # Start new section
                section_title = paragraph.rstrip(':')
                current_section = []
            else:
                current_section.append(paragraph)
        
        # Add final section
        if current_section:
            sections.append({
                'title': section_title or 'Financial Advice',
                'content': current_section
            })
        
        # Format the response beautifully
        formatted_parts = []
        
        for section in sections:
            formatted_parts.append(f"**{section['title']}**")
            formatted_parts.append("")  # Empty line
            
            for item in section['content']:
                # Check if it's a list item
                if item.startswith(('-', '•', '*')) or re.match(r'^\d+\.', item):
                    formatted_parts.append(f"  {item}")
                else:
                    formatted_parts.append(item)
            
            formatted_parts.append("")  # Empty line between sections
        
        # Add action items if any
        if action_items:
            formatted_parts.append("**Next Steps:**")
            formatted_parts.append("")
            for i, item in enumerate(action_items, 1):
                formatted_parts.append(f"{i}. {item}")
            formatted_parts.append("")
        
        # Add key insights if any
        if key_numbers:
            formatted_parts.append("**Key Numbers:**")
            formatted_parts.append("")
            for insight in key_numbers:
                formatted_parts.append(f"• **{insight['value']}** - {insight['context']}")
        
        return "\n".join(formatted_parts).strip()
    
    @staticmethod
    def _create_structured_sections(response: str) -> List[Dict[str, any]]:
        """Break response into structured sections"""
        sections = []
        
        # Look for common financial advice patterns
        section_patterns = {
            'Getting Started': r'(?:getting started|how to start|begin with).*?(?=\n\n|\n[A-Z]|$)',
            'Investment Options': r'(?:investment options|types of investments|consider).*?(?=\n\n|\n[A-Z]|$)',
            'Action Steps': r'(?:steps|priorities|should).*?(?=\n\n|\n[A-Z]|$)',
            'Long-term Benefits': r'(?:long.?term|advantage|benefit|compound).*?(?=\n\n|\n[A-Z]|$)'
        }
        
        for title, pattern in section_patterns.items():
            matches = re.findall(pattern, response, re.IGNORECASE | re.DOTALL)
            if matches:
                sections.append({
                    'title': title,
                    'content': matches[0].strip(),
                    'type': 'advice'
                })
        
        return sections
    
    @staticmethod
    def _format_main_message(advice: str, user_profile: UserFinancialProfile) -> str:
        """Format the main message with appropriate greeting"""
        greeting = ""
        if user_profile.demographic == DemographicType.STUDENT:
            greeting = "Great question! "
        else:
            greeting = "Here's my analysis: "
        
        return f"{greeting}{advice}"

# Global formatter instance
response_formatter = ResponseFormatter()
