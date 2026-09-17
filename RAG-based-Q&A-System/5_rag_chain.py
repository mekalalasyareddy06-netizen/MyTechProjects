from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

load_dotenv()

# --- Load vector store ---
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# --- LLM (Groq — free and fast) ---
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

# --- Prompt ---
prompt = ChatPromptTemplate.from_template("""
You are a helpful assistant. Answer the question using ONLY the context below.
If the answer is not in the context, say "I don't know based on the provided documents."

Context:
{context}

Question: {question}

Answer:
""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# --- RAG chain ---
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# --- Test ---
questions = [
    "What is RAG and how does it work?",
    "What is the difference between machine learning and deep learning?",
    "What are vector databases used for?",
    "Who invented Python?",  # Not in doc — should say "I don't know"
]

for q in questions:
    print(f"\nQ: {q}")
    answer = rag_chain.invoke(q)
    print(f"A: {answer}")
    print("-" * 60)
