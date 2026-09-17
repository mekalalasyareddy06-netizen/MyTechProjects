from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain.agents import create_agent
from datetime import datetime
import wikipedia
import math

load_dotenv()

llm = ChatGroq(model="qwen/qwen3-32b")

# --- Define Tools ---
# Any Python function decorated with @tool becomes available to the agent

@tool
def lookup(query: str) -> str:
    """Look up factual information about any topic using Wikipedia."""
    try:
        result = wikipedia.summary(query, sentences=3)
        return result
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Ambiguous. Try one of: {e.options[:5]}"
    except wikipedia.exceptions.PageError:
        return f"No page found for '{query}'."

@tool
def calculate(expression: str) -> str:
    """Evaluate a math expression like '2 + 2', 'sqrt(144)', '100 / 4'."""
    try:
        allowed = {k: getattr(math, k) for k in dir(math) if not k.startswith("_")}
        allowed["abs"] = abs
        result = eval(expression, {"__builtins__": {}}, allowed)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

@tool
def get_current_date() -> str:
    """Returns today's date and current time."""
    return datetime.now().strftime("%A, %B %d, %Y at %H:%M")

# --- Create Agent ---
tools = [lookup, calculate, get_current_date]

agent = create_agent(
    llm,
    tools,
    system_prompt="You are a helpful assistant. Always use the provided tools to answer questions — never rely on your training knowledge alone."
)

def run_agent(query: str) -> str:
    try:
        result = agent.invoke({"messages": [("human", query)]})
        return result["messages"][-1].content
    except Exception as e:
        return f"Agent error: {e}"

# --- Demo queries ---
queries = [
    "What is today's date and time?",
    "What is the square root of 1764?",
    "Who created the Python programming language?",
    "What is 2024 divided by 8?",
]

print("=== AI Agent with Tools ===\n")
for q in queries:
    print(f"Question: {q}")
    answer = run_agent(q)
    print(f"Answer: {answer}\n")
    print("-" * 60 + "\n")

# --- Interactive mode ---
print("=== Interactive Agent (type 'quit' to exit) ===\n")
while True:
    user_input = input("Ask the agent: ").strip()
    if user_input.lower() in ("quit", "exit", "q"):
        break
    if not user_input:
        continue
    answer = run_agent(user_input)
    print(f"Agent: {answer}\n")
