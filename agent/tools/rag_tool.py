import sys
sys.path.append('.')

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from rag.loader import load_bank_statement
from rag.embedder import embed_transactions
from rag.retriever import store_embeddings, query_bank_data

@tool
def search_bank_data(question: str, config: RunnableConfig) -> str:
    """Search the user's personal bank statement and transaction history.
    ALWAYS use this tool when the user asks about their own spending,
    expenses, income, budget, or personal financial data.
    This tool has access to the user's actual bank transactions."""
    thread_id = config["configurable"]["thread_id"]
    results = query_bank_data(question, thread_id)
    return "\n".join(results)

def load_user_bank_data(filepath: str, thread_id: str) -> None:
    transactions = load_bank_statement(filepath)
    chunks, embeddings = embed_transactions(transactions)
    store_embeddings(chunks, embeddings, thread_id)