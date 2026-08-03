import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.Client()

def get_collection(collection_id: str):
    return client.get_or_create_collection(f"bank_transactions_{collection_id}")

def store_embeddings(chunks: list, embeddings, collection_id: str) -> None:
    try:
        client.delete_collection(f"bank_transactions_{collection_id}")
    except:
        pass  # collection didn't exist yet, that's fine
    
    # create fresh collection
    collection = get_collection(collection_id)
    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),
        ids=[str(i) for i in range(len(chunks))]
    )

def query_bank_data(question: str, collection_id: str, n_results: int = 3) -> list:
    collection = get_collection(collection_id)
    results = collection.query(
        query_embeddings=[model.encode(question).tolist()],
        n_results=n_results
    )
    return results["documents"][0]