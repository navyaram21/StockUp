import chromadb
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.Client()
collection = client.get_or_create_collection("bank_transactions")
def store_embeddings(chunks: list, embeddings) -> None:
    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),
        ids=[str(i) for i in range(len(chunks))]
    )
def query_bank_data(question: str, n_results: int = 3) -> list:
    results = collection.query(
    query_embeddings=[model.encode(question).tolist()],
    n_results=n_results
    )
    return results["documents"][0]
