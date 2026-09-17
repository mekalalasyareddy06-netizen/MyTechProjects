from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

queries = [
    "What is machine learning?",
    "How do embeddings work?",
    "What are LLMs?",
]

for query in queries:
    print(f"\nQuery: {query}")
    print("-" * 50)
    results = retriever.invoke(query)
    for i, doc in enumerate(results):
        print(f"  [{i+1}] {doc.page_content[:150].strip()}...")
