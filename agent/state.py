
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages :Annotated[list,add_messages]
    portfolio_data:dict
    budget_context :str
    await_approval : bool