from langgraph.checkpoint.memory import InMemorySaver
from agent.state import AgentState
from agent.tools.rag_tool import search_bank_data
from agent.nodes import make_planner_node, make_tool_executor, llm
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import tools_condition

async def build_graph(alpaca_key: str, alpaca_secret: str, av_key: str):
    mcp_config = {
        "alpaca": {
            "command": "uvx",
            "args": ["alpaca-mcp-server"],
            "transport": "stdio",
            "env": {
                "ALPACA_API_KEY": alpaca_key,
                "ALPACA_SECRET_KEY": alpaca_secret,
                "ALPACA_PAPER_TRADE": "true",
                "ALPACA_TOOLSETS": "account,trading,stock-data,news"
            }
        },
        "alphavantage": {
            "command": "python",
            "args": ["agent/tools/alpha_vantage_server.py"],
            "transport": "stdio",
            "env": {
                "ALPHA_VANTAGE_API_KEY": av_key
            }
        }
    }
    client = MultiServerMCPClient(mcp_config)
    tools = await client.get_tools()
    tools = tools + [search_bank_data]
    llm_with_tools = llm.bind_tools(tools)
    tool_executor = make_tool_executor(tools)
    graph = StateGraph(AgentState)
    graph.add_node("planner", make_planner_node(llm_with_tools))
    graph.add_node("tools", tool_executor)
    graph.add_edge(START, "planner")
    graph.add_conditional_edges("planner", tools_condition)
    graph.add_edge("tools", "planner")
    workflow = graph.compile(
        checkpointer=InMemorySaver(),
        interrupt_before=["tools"]
    )
    image = workflow.get_graph().draw_mermaid_png()
    with open("tool_graph.png", mode="wb") as f:
        f.write(image)
    return workflow