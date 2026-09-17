from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

# Load document
loader = TextLoader("data/sample.txt")
docs = loader.load()

# Split into chunks
# chunk_size: max characters per chunk
# chunk_overlap: characters shared between adjacent chunks (preserves context)
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
chunks = splitter.split_documents(docs)

print(f"Original document: {len(docs[0].page_content)} characters")
print(f"Split into {len(chunks)} chunks\n")

for i, chunk in enumerate(chunks):
    print(f"--- Chunk {i+1} ({len(chunk.page_content)} chars) ---")
    print(chunk.page_content)
    print()
