

import sys
sys.path.append('.')
from langchain_core.tools import tool
from rag.retriever import query_bank_data,store_embeddings
from rag.loader import load_bank_statement
from rag.embedder import embed_transactions
transactions = load_bank_statement("data/bank_statement.csv")
chunks, embeddings = embed_transactions(transactions)
store_embeddings(chunks, embeddings)

@tool
def search_bank_data(question: str) -> str:
    """Search the user's personal bank statement and transaction history.
    ALWAYS use this tool when the user asks about their own spending, 
    expenses, income, budget, or personal financial data.
    This tool has access to the user's actual bank transactions."""
    results = query_bank_data(question)
    return "\n".join(results)