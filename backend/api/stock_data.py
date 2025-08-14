from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.services.database_stock_service import DatabaseStockService
from backend.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

stock_service = DatabaseStockService()

@router.get("/stock-quote/{symbol}")
async def get_stock_quote(symbol: str) -> Dict[str, Any]:
    """Get stock quote from database"""
    try:
        quote = await stock_service.get_stock_quote(symbol.upper())
        if not quote:
            raise HTTPException(status_code=404, detail=f"Stock data not found for symbol: {symbol}")
        
        return {
            "success": True,
            "data": quote
        }
    except Exception as e:
        logger.error(f"Error getting stock quote: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock data")

@router.post("/stock-quotes")
async def get_multiple_quotes(symbols: List[str]) -> Dict[str, Any]:
    """Get quotes for multiple symbols from database"""
    try:
        if not symbols:
            raise HTTPException(status_code=400, detail="No symbols provided")
        
        quotes = await stock_service.get_multiple_quotes(symbols)
        
        return {
            "success": True,
            "data": quotes
        }
    except Exception as e:
        logger.error(f"Error getting multiple quotes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock data")

@router.get("/stock-history/{symbol}")
async def get_stock_history(
    symbol: str, 
    days: int = Query(default=30, ge=1, le=365)
) -> Dict[str, Any]:
    """Get historical stock data from database"""
    try:
        history = await stock_service.get_stock_history(symbol.upper(), days)
        
        return {
            "success": True,
            "data": history
        }
        
    except Exception as e:
        logger.error(f"Error getting stock history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch historical data")

@router.get("/stock-search")
async def search_stocks(q: str = Query(..., min_length=1)) -> Dict[str, Any]:
    """Search for stocks in database"""
    try:
        results = await stock_service.search_stocks(q)
        
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search stocks")

@router.get("/market-overview")
async def get_market_overview() -> Dict[str, Any]:
    """Get market overview from database"""
    try:
        overview = await stock_service.get_market_overview()
        
        return {
            "success": True,
            "data": overview
        }
    except Exception as e:
        logger.error(f"Error getting market overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market overview")

@router.post("/portfolio/add")
async def add_to_portfolio(
    user_id: str,
    stock_symbol: str,
    quantity: int,
    purchase_price: float,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Add stock to user portfolio"""
    try:
        from backend.database import Portfolio
        
        portfolio_item = Portfolio(
            user_id=user_id,
            stock_symbol=stock_symbol.upper(),
            quantity=quantity,
            purchase_price=purchase_price
        )
        
        db.add(portfolio_item)
        db.commit()
        db.refresh(portfolio_item)
        
        return {
            "success": True,
            "message": "Stock added to portfolio successfully",
            "data": {
                "id": portfolio_item.id,
                "stock_symbol": portfolio_item.stock_symbol,
                "quantity": portfolio_item.quantity,
                "purchase_price": portfolio_item.purchase_price
            }
        }
    except Exception as e:
        logger.error(f"Error adding to portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add stock to portfolio")

@router.get("/portfolio/{user_id}")
async def get_user_portfolio(user_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get user's portfolio"""
    try:
        from backend.database import Portfolio
        
        portfolio_items = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
        
        portfolio_data = []
        for item in portfolio_items:
            # Get current stock price
            current_quote = await stock_service.get_stock_quote(item.stock_symbol)
            current_price = current_quote["price"] if current_quote else item.purchase_price
            
            portfolio_data.append({
                "id": item.id,
                "stock_symbol": item.stock_symbol,
                "quantity": item.quantity,
                "purchase_price": item.purchase_price,
                "current_price": current_price,
                "total_value": current_price * item.quantity,
                "gain_loss": (current_price - item.purchase_price) * item.quantity,
                "gain_loss_percent": ((current_price - item.purchase_price) / item.purchase_price) * 100,
                "purchase_date": item.purchase_date.isoformat()
            })
        
        return {
            "success": True,
            "data": portfolio_data
        }
    except Exception as e:
        logger.error(f"Error getting portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio")
