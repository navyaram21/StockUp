from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agent.graph import build_graph
from contextlib import asynccontextmanager
import uuid

graph = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global graph
    graph = await build_graph()
    yield

app = FastAPI(lifespan=lifespan)
class ChatRequest(BaseModel):
    message: str
    thread_id: str = ""

class ApproveRequest(BaseModel):
    thread_id: str

class RejectRequest(BaseModel):
    thread_id: str
@app.post("/chat")
async def chat(request: ChatRequest):
    thread_id = request.thread_id or str(uuid.uuid4())
    input_state = {
        "messages": [{"role": "user", "content": request.message}],
        "portfolio_data": {},
        "budget_context": "",
        "awaiting_approval": False
    }
    config = {"configurable": {"thread_id":thread_id}}
    result = await graph.ainvoke(input_state, config)
    last_message = result["messages"][-1]
    if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
        return {"status": "complete", "response": last_message.content,"thread_id": thread_id}
    else:
        return {"status": "pending", "action": last_message.tool_calls[0],"thread_id": thread_id}

@app.post("/approve")
async def approve(request: ApproveRequest):
    config = {"configurable": {"thread_id": request.thread_id}}
    result = await graph.ainvoke(None, config)
    last_message = result["messages"][-1]
    return {"status": "complete", "response": last_message.content}

@app.post("/reject")
async def reject(request: RejectRequest):
    return {"status": "rejected", "response": "Action cancelled."}
