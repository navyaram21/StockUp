
from dotenv import load_dotenv
from agent.state import AgentState
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import ToolNode
load_dotenv()
llm = ChatAnthropic(model="claude-haiku-4-5-20251001")

def make_planner_node(llm_with_tools):
    def planner_node(state: AgentState):
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    return planner_node
def make_tool_executor(tools):
    return ToolNode(tools)