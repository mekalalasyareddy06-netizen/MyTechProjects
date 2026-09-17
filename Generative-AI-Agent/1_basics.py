from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# --- 1. Basic LLM call ---
llm = ChatGroq(model="llama-3.1-8b-instant")

response = llm.invoke("What is LangChain in one sentence?")
print("=== Direct LLM call ===")
print(response.content)

# --- 2. Prompt Template ---
# Templates let you reuse prompts with different inputs
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that explains {topic} concepts simply."),
    ("human", "{question}")
])

# --- 3. Chain: prompt -> llm -> parser ---
# The pipe | connects steps: output of one feeds into the next
chain = prompt | llm | StrOutputParser()

print("\n=== Prompt Template + Chain ===")
result = chain.invoke({
    "topic": "machine learning",
    "question": "What is RAG (Retrieval Augmented Generation)?"
})
print(result)

# --- 4. Multiple inputs at once (batch) ---
print("\n=== Batch calls ===")
questions = [
    {"topic": "AI", "question": "What is a vector database?"},
    {"topic": "AI", "question": "What is an embedding?"},
]
results = chain.batch(questions)
for q, r in zip(questions, results):
    print(f"\nQ: {q['question']}")
    print(f"A: {r}")
