from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent.graph import build_graph
from agent.tools.rag_tool import load_user_bank_data
from contextlib import asynccontextmanager
import uuid
import shutil

graph_sessions = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectRequest(BaseModel):
    alpaca_api_key: str
    alpaca_secret_key: str
    alpha_vantage_api_key: str

class ChatRequest(BaseModel):
    message: str
    thread_id: str

class ApproveRequest(BaseModel):
    thread_id: str

class RejectRequest(BaseModel):
    thread_id: str

@app.post("/connect")
async def connect(request: ConnectRequest):
    thread_id = str(uuid.uuid4())
    graph = await build_graph(
        alpaca_key=request.alpaca_api_key,
        alpaca_secret=request.alpaca_secret_key,
        av_key=request.alpha_vantage_api_key
    )
    graph_sessions[thread_id] = graph
    return {"thread_id": thread_id}

@app.post("/chat")
async def chat(request: ChatRequest):
    graph = graph_sessions.get(request.thread_id)
    if not graph:
        raise HTTPException(status_code=401, detail="Session not found. Please connect first.")
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
        return {"status": "complete", "response": last_message.content, "thread_id": request.thread_id}
    else:
        return {"status": "pending", "action": last_message.tool_calls[0], "thread_id": request.thread_id}

@app.post("/approve")
async def approve(request: ApproveRequest):
    graph = graph_sessions.get(request.thread_id)
    if not graph:
        raise HTTPException(status_code=401, detail="Session not found.")
    config = {"configurable": {"thread_id": request.thread_id}}
    result = await graph.ainvoke(None, config)
    last_message = result["messages"][-1]
    return {"status": "complete", "response": last_message.content}

@app.post("/reject")
async def reject(request: RejectRequest):
    return {"status": "rejected", "response": "Action cancelled."}

@app.post("/upload")
async def upload_bank_statement(file: UploadFile = File(...), thread_id: str = Form(...)):
    if thread_id not in graph_sessions:
        raise HTTPException(status_code=401, detail="Session not found. Please connect first.")
    filepath = f"data/bank_{thread_id}.csv"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    load_user_bank_data(filepath, thread_id)
    return {"status": "uploaded", "thread_id": thread_id}