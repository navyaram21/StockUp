from sentence_transformers import SentenceTransformer
import sys
model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_transactions(transactions: list) -> tuple:
    embeddings = model.encode(transactions)
    return transactions, embeddings
