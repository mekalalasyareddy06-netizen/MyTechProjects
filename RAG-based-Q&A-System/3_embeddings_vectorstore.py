from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

# Step 1: Load and split documents
loader = TextLoader("data/sample.txt")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
chunks = splitter.split_documents(docs)
print(f"Created {len(chunks)} chunks")

# Step 2: Local embeddings (free, no API key needed)
# Downloads ~90MB model on first run, cached after that
print("Loading embedding model (downloads once, then cached)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Step 3: Build FAISS vector store
print("Building FAISS vector store...")
vectorstore = FAISS.from_documents(chunks, embeddings)

# Step 4: Save to disk
vectorstore.save_local("faiss_index")
print("Vector store saved to faiss_index/")

# Step 5: Quick test
query = "What is RAG?"
results = vectorstore.similarity_search(query, k=2)
print(f"\nTop 2 results for query: '{query}'")
for i, doc in enumerate(results):
    print(f"\n[{i+1}] {doc.page_content[:200]}...")
