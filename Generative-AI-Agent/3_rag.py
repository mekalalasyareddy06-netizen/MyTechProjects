from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

llm = ChatGroq(model="llama-3.1-8b-instant")

# --- Step 1: Load documents ---
print("Loading documents...")
loader = WebBaseLoader("https://en.wikipedia.org/wiki/Retrieval-augmented_generation")
docs = loader.load()
print(f"Loaded {len(docs)} document(s), {len(docs[0].page_content)} characters")

# --- Step 2: Split into chunks ---
# Large documents must be split so they fit in the LLM's context window
# overlap=200 ensures chunks share some context at the edges
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)
print(f"Split into {len(chunks)} chunks")

# --- Step 3: Create embeddings + store in vector DB ---
# HuggingFace embeddings run locally, no API key needed
print("Creating embeddings (this may take a moment the first time)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Store chunks as vectors in ChromaDB (persisted to disk)
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)
print("Vector store created and saved to ./chroma_db")

# --- Step 4: Create retriever ---
# k=3 means "return the 3 most relevant chunks for each query"
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# --- Step 5: RAG chain ---
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant. Answer the question using ONLY
the context provided below. If the answer isn't in the context, say so.

Context:
{context}"""),
    ("human", "{question}")
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
    | StrOutputParser()
)

# --- Step 6: Ask questions ---
questions = [
    "What is Retrieval Augmented Generation?",
    "What are the main benefits of RAG over standard LLMs?",
    "What components make up a RAG system?",
]

print("\n=== RAG Question & Answer ===\n")
for q in questions:
    print(f"Q: {q}")
    answer = rag_chain.invoke(q)
    print(f"A: {answer}\n")

# --- Interactive mode ---
print("=== Ask your own questions (type 'quit' to exit) ===\n")
while True:
    question = input("Your question: ").strip()
    if question.lower() in ("quit", "exit", "q"):
        break
    if not question:
        continue
    answer = rag_chain.invoke(question)
    print(f"Answer: {answer}\n")
