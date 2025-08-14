from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import logging
from .api.chat import router as chat_router
from .api.financial_guidance import router as guidance_router
from .api.budget_analysis import router as budget_router
from .api.spending_insights import router as insights_router
from .api.stock_data import router as stock_router
from .api.tax_optimizer import router as tax_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Personal Finance Chatbot API",
    description="AI-powered financial guidance system using IBM Granite model",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(chat_router)
app.include_router(guidance_router)
app.include_router(budget_router)
app.include_router(insights_router)
app.include_router(stock_router)
app.include_router(tax_router)

@app.get("/")
async def root():
    return {
        "message": "Personal Finance Chatbot API",
        "status": "active",
        "features": [
            "Personalized Financial Guidance",
            "AI-Generated Budget Summaries", 
            "Spending Insights and Suggestions",
            "Demographic-Aware Communication",
            "Conversational NLP Experience",
            "Real-time Stock Market Data",
            "Investment Portfolio Tracking",
            "Tax Optimization"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
