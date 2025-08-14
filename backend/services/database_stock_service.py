from sqlalchemy.orm import Session
from backend.database import get_db, Stock, Portfolio
from backend.models.stock_models import StockResponse, StockQuoteResponse, PortfolioCreate, PortfolioResponse
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DatabaseStockService:
    """Stock service using local database instead of external APIs"""
    
    def __init__(self):
        pass
    
    def get_db_session(self) -> Session:
        """Get database session"""
        return next(get_db())
    
    async def get_stock_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get stock quote from database"""
        try:
            db = self.get_db_session()
            stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
            
            if not stock:
                return None
            
            # Calculate random daily change (simulate market movement)
            change_percent = random.uniform(-3.0, 3.0)
            change = stock.current_price * (change_percent / 100)
            
            return {
                "symbol": stock.symbol,
                "company_name": stock.company_name,
                "price": round(stock.current_price, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "market_cap": stock.market_cap,
                "pe_ratio": stock.pe_ratio,
                "volume": random.randint(100000, 5000000),
                "currency": stock.currency,
                "exchange": stock.exchange,
                "sector": stock.sector,
                "last_updated": stock.last_updated.isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting stock quote for {symbol}: {e}")
            return None
        finally:
            db.close()
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Any]:
        """Get quotes for multiple symbols from database"""
        try:
            db = self.get_db_session()
            quotes = {}
            
            for symbol in symbols:
                stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
                if stock:
                    change_percent = random.uniform(-3.0, 3.0)
                    change = stock.current_price * (change_percent / 100)
                    
                    quotes[symbol.upper()] = {
                        "symbol": stock.symbol,
                        "company_name": stock.company_name,
                        "price": round(stock.current_price, 2),
                        "change": round(change, 2),
                        "change_percent": round(change_percent, 2),
                        "market_cap": stock.market_cap,
                        "pe_ratio": stock.pe_ratio,
                        "volume": random.randint(100000, 5000000),
                        "currency": stock.currency
                    }
            
            return quotes
        except Exception as e:
            logger.error(f"Error getting multiple quotes: {e}")
            return {}
        finally:
            db.close()
    
    async def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        """Search stocks in database"""
        try:
            db = self.get_db_session()
            
            # Search by symbol or company name
            stocks = db.query(Stock).filter(
                (Stock.symbol.ilike(f"%{query.upper()}%")) |
                (Stock.company_name.ilike(f"%{query}%"))
            ).limit(10).all()
            
            results = []
            for stock in stocks:
                results.append({
                    "symbol": stock.symbol,
                    "company_name": stock.company_name,
                    "price": stock.current_price,
                    "market_cap": stock.market_cap,
                    "sector": stock.sector,
                    "currency": stock.currency,
                    "exchange": stock.exchange
                })
            
            return results
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []
        finally:
            db.close()
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """Get market overview from database"""
        try:
            db = self.get_db_session()
            
            # Get top stocks by market cap
            top_stocks = db.query(Stock).order_by(Stock.market_cap.desc()).limit(5).all()
            
            # Calculate market metrics
            total_market_cap = db.query(Stock).count()
            avg_pe_ratio = db.query(Stock).filter(Stock.pe_ratio.isnot(None)).all()
            avg_pe = sum([s.pe_ratio for s in avg_pe_ratio if s.pe_ratio]) / len(avg_pe_ratio) if avg_pe_ratio else 20.0
            
            # Simulate market indices (based on top stocks performance)
            nifty_change = random.uniform(-1.5, 1.5)
            sensex_change = random.uniform(-1.2, 1.8)
            
            market_data = {
                "indices": {
                    "NIFTY 50": {
                        "value": 21500 + (nifty_change * 100),
                        "change": nifty_change,
                        "change_percent": round(nifty_change / 215, 2)
                    },
                    "SENSEX": {
                        "value": 71000 + (sensex_change * 200),
                        "change": sensex_change * 200,
                        "change_percent": round(sensex_change / 710, 2)
                    }
                },
                "market_stats": {
                    "total_companies": total_market_cap,
                    "average_pe_ratio": round(avg_pe, 2),
                    "market_status": "Open" if 9 <= datetime.now().hour <= 15 else "Closed"
                },
                "top_gainers": [],
                "top_losers": [],
                "most_active": []
            }
            
            # Add top stocks with simulated performance
            for stock in top_stocks:
                change_percent = random.uniform(-4.0, 4.0)
                stock_data = {
                    "symbol": stock.symbol,
                    "company_name": stock.company_name,
                    "price": stock.current_price,
                    "change_percent": round(change_percent, 2),
                    "volume": random.randint(500000, 3000000)
                }
                
                if change_percent > 2:
                    market_data["top_gainers"].append(stock_data)
                elif change_percent < -2:
                    market_data["top_losers"].append(stock_data)
                
                market_data["most_active"].append(stock_data)
            
            return market_data
        except Exception as e:
            logger.error(f"Error getting market overview: {e}")
            return {
                "indices": {},
                "market_stats": {},
                "top_gainers": [],
                "top_losers": [],
                "most_active": []
            }
        finally:
            db.close()
    
    async def get_stock_history(self, symbol: str, days: int = 30) -> List[Dict[str, Any]]:
        """Generate historical data for a stock"""
        try:
            db = self.get_db_session()
            stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
            
            if not stock:
                return []
            
            # Generate realistic historical data
            history = []
            base_price = stock.current_price
            
            for i in range(days):
                date = (datetime.now() - timedelta(days=days-i)).strftime("%Y-%m-%d")
                
                # Simulate price movement
                daily_change = random.uniform(-0.03, 0.03)  # ±3% daily change
                base_price *= (1 + daily_change)
                
                # Ensure price doesn't go too far from current price
                if abs(base_price - stock.current_price) / stock.current_price > 0.2:
                    base_price = stock.current_price * random.uniform(0.9, 1.1)
                
                history.append({
                    "date": date,
                    "open": round(base_price * random.uniform(0.995, 1.005), 2),
                    "high": round(base_price * random.uniform(1.01, 1.03), 2),
                    "low": round(base_price * random.uniform(0.97, 0.99), 2),
                    "close": round(base_price, 2),
                    "volume": random.randint(100000, 2000000)
                })
            
            return history
        except Exception as e:
            logger.error(f"Error getting stock history: {e}")
            return []
        finally:
            db.close()
