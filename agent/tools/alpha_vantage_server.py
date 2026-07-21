

from fastmcp import FastMCP
import os
import httpx
from dotenv import load_dotenv
load_dotenv()
mcp = FastMCP("Alpha Vantage MCP server")
api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
@mcp.tool()
def get_stock_news(ticker:str,limit:int=5)->dict:
    """get latest news and sentiment on stock tickers like  AAPL or TSLA"""
    
    response = httpx.get(
        "https://www.alphavantage.co/query",
        params={
            "function": "NEWS_SENTIMENT",
            "tickers": ticker,
            "apikey": api_key,
            "limit": limit
         }
    )
    return response.json()
@mcp.tool()
def company_summary(ticker:str) ->dict:
    """get company overview and fundamental datapoints  on stock tickers like  AAPL or TSLA """
    response = httpx.get(
        "https://www.alphavantage.co/query",
        params={
            "function": "OVERVIEW",
            "symbol": ticker,
            "apikey": api_key,
         }
    )
    return response.json()
if __name__ == "__main__":
    mcp.run()
