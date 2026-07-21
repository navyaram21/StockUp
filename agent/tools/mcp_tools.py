
import os
from dotenv import load_dotenv

load_dotenv()

MCP_CONFIG = {
    "alpaca": {
        "command": "uvx",
        "args": ["alpaca-mcp-server"],
        "transport": "stdio",
        "env": {
            "ALPACA_API_KEY":os.getenv("ALPACA_API_KEY"),
            "ALPACA_SECRET_KEY":os.getenv("ALPACA_SECRET_KEY"),
            "ALPACA_PAPER_TRADE":os.getenv("ALPACA_PAPER_TRADE"),
            "ALPACA_TOOLSETS":os.getenv("ALPACA_TOOLSETS"),

        }
    },
    "alphavantage": {
        "command":"python",
        "args":["agent/tools/alpha_vantage_server.py"],
        "transport":"stdio"
    }
}
