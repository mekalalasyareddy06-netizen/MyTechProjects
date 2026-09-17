"""
RAG Q&A App — Complete Pipeline
Ask questions about documents in the data/ folder.
Run: ./venv/bin/python app.py
"""
import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

load_dotenv()

FAISS_INDEX_PATH = "faiss_index"
EMBED_MODEL = "all-MiniLM-L6-v2"


def load_documents():
    docs = []
    txt_loader = DirectoryLoader("data/", glob="**/*.txt", loader_cls=TextLoader)
    docs.extend(txt_loader.load())
    for fname in os.listdir("data/"):
        if fname.endswith(".pdf"):
            pdf_loader = PyPDFLoader(f"data/{fname}")
            docs.extend(pdf_loader.load())
    return docs


def build_vectorstore(embeddings):
    print("Loading documents from data/...")
    docs = load_documents()
    print(f"  Loaded {len(docs)} document(s)")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(docs)
    print(f"  Split into {len(chunks)} chunks")
    print("  Building FAISS index...")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(FAISS_INDEX_PATH)
    print(f"  Index saved to {FAISS_INDEX_PATH}/")
    return vectorstore


def load_or_build_vectorstore(embeddings):
    if os.path.exists(FAISS_INDEX_PATH):
        print("Loading existing FAISS index...")
        return FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    return build_vectorstore(embeddings)


def build_rag_chain(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

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

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain, retriever


def main():
    print("=" * 60)
    print("     RAG Q&A System — Powered by LangChain + Groq (Free)")
    print("=" * 60)

    print("\nLoading embedding model (downloads once, then cached)...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)

    vectorstore = load_or_build_vectorstore(embeddings)
    chain, retriever = build_rag_chain(vectorstore)

    print("\nReady! Type your question (or 'rebuild' to re-index, 'quit' to exit)\n")

    while True:
        question = input("You: ").strip()
        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break
        if question.lower() == "rebuild":
            vectorstore = build_vectorstore(embeddings)
            chain, retriever = build_rag_chain(vectorstore)
            print("Index rebuilt.\n")
            continue

        answer = chain.invoke(question)
        print(f"\nAssistant: {answer}")

        sources = retriever.invoke(question)
        print("\nSources used:")
        for i, doc in enumerate(sources, 1):
            src = doc.metadata.get("source", "unknown")
            preview = doc.page_content[:100].replace("\n", " ")
            print(f"  [{i}] {src}: {preview}...")
        print()


if __name__ == "__main__":
    main()
