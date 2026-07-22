from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agent.graph import build_graph

app = FastAPI()
class ChatRequest(BaseModel):
    message: str
    thread_id: str

class ApproveRequest(BaseModel):
    thread_id: str

class RejectRequest(BaseModel):
    thread_id: str
@app.post("/chat")
async def chat(request: ChatRequest):
    graph = await build_graph()
    input_state = {
        "messages": [{"role": "user", "content": request.message}],
        "portfolio_data": {},
        "budget_context": "",
        "awaiting_approval": False
    }
    config = {"configurable": {"thread_id": request.thread_id}}
    result = await graph.ainvoke(input_state, config)
    last_message = result["messages"][-1]
    if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
        return {"status": "complete", "response": last_message.content}
    else:
        return {"status": "pending", "action": last_message.tool_calls[0]}
    