import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, create_tables, Stock
from datetime import datetime

def populate_indian_stocks():
    """Populate database with Indian stock market data"""
    
    # Create tables if they don't exist
    create_tables()
    
    # Stock data provided by user
    indian_stocks = [
        {
            "symbol": "RELIANCE",
            "company_name": "Reliance Industries",
            "current_price": 1384.0,
            "market_cap": 1873435.0,  # in crores
            "pe_ratio": 22.98,
            "sector": "Oil & Gas"
        },
        {
            "symbol": "HDFCBANK",
            "company_name": "HDFC Bank",
            "current_price": 1976.0,
            "market_cap": 1516682.0,
            "pe_ratio": 21.81,
            "sector": "Banking"
        },
        {
            "symbol": "TCS",
            "company_name": "Tata Consultancy Services (TCS)",
            "current_price": 3032.0,
            "market_cap": 1097185.0,
            "pe_ratio": 22.65,
            "sector": "IT Services"
        },
        {
            "symbol": "BHARTIARTL",
            "company_name": "Bharti Airtel",
            "current_price": 1855.0,
            "market_cap": 1076193.0,
            "pe_ratio": 47.56,
            "sector": "Telecommunications"
        },
        {
            "symbol": "ICICIBANK",
            "company_name": "ICICI Bank",
            "current_price": 1419.0,
            "market_cap": 1013056.0,
            "pe_ratio": 20.75,
            "sector": "Banking"
        },
        {
            "symbol": "SBIN",
            "company_name": "State Bank of India (SBI)",
            "current_price": 822.0,
            "market_cap": 759402.0,
            "pe_ratio": 10.37,
            "sector": "Banking"
        },
        {
            "symbol": "INFY",
            "company_name": "Infosys",
            "current_price": 1427.0,
            "market_cap": 592932.0,
            "pe_ratio": 22.83,
            "sector": "IT Services"
        },
        {
            "symbol": "HINDUNILVR",
            "company_name": "Hindustan Unilever",
            "current_price": 2485.0,
            "market_cap": 584014.0,
            "pe_ratio": 54.80,
            "sector": "FMCG"
        },
        {
            "symbol": "LICI",
            "company_name": "Life Insurance Corp. of India (LIC)",
            "current_price": 918.0,
            "market_cap": 580856.0,
            "pe_ratio": 12.00,
            "sector": "Insurance"
        },
        {
            "symbol": "BAJFINANCE",
            "company_name": "Bajaj Finance",
            "current_price": 8525.0,
            "market_cap": 529612.0,
            "pe_ratio": 31.85,
            "sector": "Financial Services"
        },
        {
            "symbol": "ITC",
            "company_name": "ITC Ltd.",
            "current_price": 416.0,
            "market_cap": 521368.0,
            "pe_ratio": 15.01,
            "sector": "FMCG"
        },
        {
            "symbol": "LT",
            "company_name": "Larsen & Toubro (L&T)",
            "current_price": 3694.0,
            "market_cap": 519659.0,
            "pe_ratio": 33.72,
            "sector": "Construction"
        },
        {
            "symbol": "HCLTECH",
            "company_name": "HCL Technologies",
            "current_price": 1494.0,
            "market_cap": 405665.0,
            "pe_ratio": 23.36,
            "sector": "IT Services"
        },
        {
            "symbol": "M&M",
            "company_name": "Mahindra & Mahindra (M&M)",
            "current_price": 3244.0,
            "market_cap": 403494.0,
            "pe_ratio": 30.03,
            "sector": "Automotive"
        },
        {
            "symbol": "MARUTI",
            "company_name": "Maruti Suzuki India",
            "current_price": 12750.0,
            "market_cap": 400864.0,
            "pe_ratio": 27.84,
            "sector": "Automotive"
        },
        {
            "symbol": "KOTAKBANK",
            "company_name": "Kotak Mahindra Bank",
            "current_price": 1970.0,
            "market_cap": 391822.0,
            "pe_ratio": 17.60,
            "sector": "Banking"
        },
        {
            "symbol": "SUNPHARMA",
            "company_name": "Sun Pharmaceutical Ind.",
            "current_price": 1619.0,
            "market_cap": 388656.0,
            "pe_ratio": 35.61,
            "sector": "Pharmaceuticals"
        },
        {
            "symbol": "ULTRACEMCO",
            "company_name": "UltraTech Cement",
            "current_price": 12455.0,
            "market_cap": 367022.0,
            "pe_ratio": 52.16,
            "sector": "Cement"
        },
        {
            "symbol": "NTPC",
            "company_name": "NTPC",
            "current_price": 341.0,
            "market_cap": 330850.0,
            "pe_ratio": 14.08,
            "sector": "Power"
        },
        {
            "symbol": "AXISBANK",
            "company_name": "Axis Bank",
            "current_price": 1066.0,
            "market_cap": 330684.0,
            "pe_ratio": 11.83,
            "sector": "Banking"
        }
    ]
    
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(Stock).delete()
        db.commit()
        
        # Insert new stock data
        for stock_data in indian_stocks:
            stock = Stock(
                symbol=stock_data["symbol"],
                company_name=stock_data["company_name"],
                current_price=stock_data["current_price"],
                market_cap=stock_data["market_cap"],
                pe_ratio=stock_data["pe_ratio"],
                currency="INR",
                exchange="NSE",
                sector=stock_data["sector"],
                last_updated=datetime.utcnow()
            )
            db.add(stock)
        
        db.commit()
        print(f"Successfully populated {len(indian_stocks)} Indian stocks in the database!")
        
        # Verify data
        count = db.query(Stock).count()
        print(f"Total stocks in database: {count}")
        
    except Exception as e:
        print(f"Error populating stock data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_indian_stocks()
