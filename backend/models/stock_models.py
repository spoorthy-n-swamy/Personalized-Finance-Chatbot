from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class StockBase(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    market_cap: float
    pe_ratio: Optional[float] = None
    currency: str = "INR"
    exchange: str = "NSE"
    sector: Optional[str] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    last_updated: datetime
    
    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    stock_symbol: str
    quantity: int
    purchase_price: float

class PortfolioCreate(PortfolioBase):
    user_id: str

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: str
    purchase_date: datetime
    
    class Config:
        from_attributes = True

class StockQuoteResponse(BaseModel):
    symbol: str
    company_name: str
    price: float
    change: float
    change_percent: float
    market_cap: float
    pe_ratio: Optional[float]
    volume: int = 1000000  # Default volume
    currency: str = "INR"
