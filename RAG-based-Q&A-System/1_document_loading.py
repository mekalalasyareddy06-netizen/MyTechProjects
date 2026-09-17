from langchain_community.document_loaders import TextLoader, PyPDFLoader, DirectoryLoader
from dotenv import load_dotenv

load_dotenv()

# --- Load a single text file ---
print("=== Text Loader ===")
loader = TextLoader("data/sample.txt")
docs = loader.load()

print(f"Number of documents: {len(docs)}")
print(f"Content preview:\n{docs[0].page_content[:300]}")
print(f"Metadata: {docs[0].metadata}")

# --- Load all text files from a folder ---
print("\n=== Directory Loader (all .txt files) ===")
dir_loader = DirectoryLoader("data/", glob="**/*.txt", loader_cls=TextLoader)
all_docs = dir_loader.load()
print(f"Total documents loaded: {len(all_docs)}")

# --- Load a PDF (uncomment if you have a PDF in data/) ---
# print("\n=== PDF Loader ===")
# pdf_loader = PyPDFLoader("data/your_file.pdf")
# pdf_docs = pdf_loader.load()
# print(f"PDF pages loaded: {len(pdf_docs)}")
# print(f"First page preview:\n{pdf_docs[0].page_content[:300]}")
