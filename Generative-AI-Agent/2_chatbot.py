from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

load_dotenv()

llm = ChatGroq(model="llama-3.1-8b-instant")

# Prompt includes a placeholder where the chat history gets injected
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant. Answer concisely."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

chain = prompt | llm | StrOutputParser()

# Store for holding conversation histories (keyed by session_id)
store = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# Wrap the chain so it automatically loads/saves history
chatbot = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history"
)

def chat(message: str, session_id: str = "default") -> str:
    return chatbot.invoke(
        {"input": message},
        config={"configurable": {"session_id": session_id}}
    )

# --- Demo: Multi-turn conversation ---
print("=== Chatbot with Memory ===\n")

print("User: My name is Alex and I'm learning LangChain.")
response = chat("My name is Alex and I'm learning LangChain.")
print(f"Bot: {response}\n")

print("User: What is the most important concept I should learn first?")
response = chat("What is the most important concept I should learn first?")
print(f"Bot: {response}\n")

print("User: Do you remember my name?")
response = chat("Do you remember my name?")
print(f"Bot: {response}\n")

# Demo: Second session (separate memory)
print("=== New session (fresh memory) ===\n")
print("User: Do you know my name?")
response = chat("Do you know my name?", session_id="session2")
print(f"Bot: {response}\n")

# --- Interactive mode ---
print("=== Interactive Chat (type 'quit' to exit) ===\n")
while True:
    user_input = input("You: ").strip()
    if user_input.lower() in ("quit", "exit", "q"):
        break
    if not user_input:
        continue
    reply = chat(user_input, session_id="interactive")
    print(f"Bot: {reply}\n")
