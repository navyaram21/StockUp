

from langgraph.checkpoint.memory import InMemorySaver
from agent.state import AgentState
from agent.tools.mcp_tools import MCP_CONFIG
from agent.nodes import make_planner_node, make_tool_executor, llm
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import tools_condition

async def build_graph():
    client = MultiServerMCPClient(MCP_CONFIG)
    tools = await client.get_tools()
    from agent.tools.rag_tool import search_bank_data
    tools = tools + [search_bank_data]
    print([t.name for t in tools])
    llm_with_tools = llm.bind_tools(tools)
    tool_executor = make_tool_executor(tools)
    graph = StateGraph(AgentState)
    graph.add_node("planner", make_planner_node(llm_with_tools))
    graph.add_node("tools", tool_executor)
    graph.add_edge(START, "planner")
    graph.add_conditional_edges("planner", tools_condition)
    graph.add_edge("tools", "planner")
    workflow = graph.compile(checkpointer=InMemorySaver(), interrupt_before=["tools"])
    image = workflow.get_graph().draw_mermaid_png()
    with open("tool_graph.png", mode="wb") as f:
         f.write(image)
    return workflow
