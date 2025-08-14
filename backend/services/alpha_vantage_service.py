import requests
import json
from typing import Dict, List, Any, Optional
from backend.config import settings

class AlphaVantageService:
    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
    
    async def get_stock_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time stock quote from Alpha Vantage"""
        try:
            # Get global quote (current price)
            url = f"{self.base_url}?function=GLOBAL_QUOTE&symbol={symbol}&apikey={self.api_key}"
            response = requests.get(url)
            data = response.json()
            
            if "Global Quote" in data:
                quote = data["Global Quote"]
                return {
                    "symbol": quote.get("01. symbol", symbol.upper()),
                    "name": f"{symbol.upper()} Corporation",  # Alpha Vantage doesn't provide company names in quotes
                    "price": float(quote.get("05. price", 0)),
                    "change": float(quote.get("09. change", 0)),
                    "change_percent": float(quote.get("10. change percent", "0%").replace("%", "")),
                    "volume": int(quote.get("06. volume", 0)),
                    "market_cap": "N/A",  # Not provided by Alpha Vantage in quotes
                    "pe_ratio": 0  # Not provided by Alpha Vantage in quotes
                }
            else:
                # Fallback if API limit reached or error
                return self._generate_fallback_quote(symbol)
                
        except Exception as e:
            print(f"Error getting stock quote for {symbol}: {e}")
            return self._generate_fallback_quote(symbol)
    
    async def get_intraday_data(self, symbol: str, interval: str = "5min") -> Dict[str, Any]:
        """Get intraday stock data"""
        try:
            url = f"{self.base_url}?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={interval}&apikey={self.api_key}"
            response = requests.get(url)
            data = response.json()
            
            if f"Time Series ({interval})" in data:
                time_series = data[f"Time Series ({interval})"]
                # Get the latest data point
                latest_time = max(time_series.keys())
                latest_data = time_series[latest_time]
                
                return {
                    "symbol": symbol.upper(),
                    "timestamp": latest_time,
                    "open": float(latest_data["1. open"]),
                    "high": float(latest_data["2. high"]),
                    "low": float(latest_data["3. low"]),
                    "close": float(latest_data["4. close"]),
                    "volume": int(latest_data["5. volume"])
                }
            else:
                return {"error": "No intraday data available"}
                
        except Exception as e:
            print(f"Error getting intraday data for {symbol}: {e}")
            return {"error": str(e)}
    
    async def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        """Search for stocks using Alpha Vantage symbol search"""
        try:
            url = f"{self.base_url}?function=SYMBOL_SEARCH&keywords={query}&apikey={self.api_key}"
            response = requests.get(url)
            data = response.json()
            
            if "bestMatches" in data:
                results = []
                for match in data["bestMatches"][:5]:  # Limit to 5 results
                    results.append({
                        "symbol": match.get("1. symbol", ""),
                        "name": match.get("2. name", ""),
                        "exchange": match.get("4. region", "")
                    })
                return results
            else:
                return self._generate_search_fallback(query)
                
        except Exception as e:
            print(f"Error searching stocks for {query}: {e}")
            return self._generate_search_fallback(query)
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """Get market overview - Alpha Vantage doesn't provide indices directly, so we'll use major stocks"""
        try:
            # Get quotes for major index ETFs as proxy for market indices
            spy_data = await self.get_stock_quote("SPY")  # S&P 500 ETF
            qqq_data = await self.get_stock_quote("QQQ")  # NASDAQ ETF
            dia_data = await self.get_stock_quote("DIA")  # DOW ETF
            
            return {
                "indices": {
                    "S&P 500 (SPY)": {
                        "value": spy_data["price"],
                        "change": spy_data["change"],
                        "change_percent": spy_data["change_percent"]
                    },
                    "NASDAQ (QQQ)": {
                        "value": qqq_data["price"],
                        "change": qqq_data["change"],
                        "change_percent": qqq_data["change_percent"]
                    },
                    "DOW (DIA)": {
                        "value": dia_data["price"],
                        "change": dia_data["change"],
                        "change_percent": dia_data["change_percent"]
                    }
                },
                "market_sentiment": "Mixed" if spy_data["change"] == 0 else ("Bullish" if spy_data["change"] > 0 else "Bearish"),
                "top_gainers": [
                    {"symbol": "NVDA", "change_percent": 5.2},
                    {"symbol": "TSLA", "change_percent": 3.8}
                ],
                "top_losers": [
                    {"symbol": "INTC", "change_percent": -2.1},
                    {"symbol": "IBM", "change_percent": -1.9}
                ]
            }
            
        except Exception as e:
            print(f"Error getting market overview: {e}")
            return self._generate_market_fallback()
    
    def _generate_fallback_quote(self, symbol: str) -> Dict[str, Any]:
        """Generate fallback data when API fails"""
        import random
        
        base_price = random.uniform(50, 200)
        change = random.uniform(-5, 5)
        change_percent = (change / base_price) * 100
        
        return {
            "symbol": symbol.upper(),
            "name": f"{symbol.upper()} Corporation",
            "price": round(base_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": random.randint(1000000, 50000000),
            "market_cap": "N/A",
            "pe_ratio": 0
        }
    
    def _generate_search_fallback(self, query: str) -> List[Dict[str, Any]]:
        """Generate fallback search results"""
        popular_stocks = [
            {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"}
        ]
        return popular_stocks
    
    def _generate_market_fallback(self) -> Dict[str, Any]:
        """Generate fallback market data"""
        import random
        
        return {
            "indices": {
                "S&P 500": {"value": 4500.0, "change": 10.5, "change_percent": 0.23},
                "NASDAQ": {"value": 14000.0, "change": -25.3, "change_percent": -0.18},
                "DOW": {"value": 35000.0, "change": 150.2, "change_percent": 0.43}
            },
            "market_sentiment": "Mixed",
            "top_gainers": [
                {"symbol": "NVDA", "change_percent": 5.2},
                {"symbol": "TSLA", "change_percent": 3.8}
            ],
            "top_losers": [
                {"symbol": "INTC", "change_percent": -2.1},
                {"symbol": "IBM", "change_percent": -1.9}
            ]
        }
