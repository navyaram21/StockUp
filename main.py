
import asyncio
from agent.graph import build_graph

async def main():
    input_state={
        "messages":[{"role":"user","content":"place an order for 1 AAPL stock and give summary as well"}],
        "portfolio_data": {},
        "budget_context": "",
        "awaiting_approval": False}
    graph = await build_graph()
    config = {"configurable": {"thread_id": "test-session-1"}}
    result = await graph.ainvoke(input_state, config)
    loop = True
    while loop:
        print(result["messages"][-1].content)
        last_message = result["messages"][-1]
        if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
            print("\n✅ Final response:")
            print(last_message.content)
            break
        print("\n⚠️  Agent wants to:")
        for tool_call in last_message.tool_calls:
            print(f"  Tool: {tool_call['name']}")
            print(f"  Action: {tool_call['args']}")

        
        # ask for approval
        approval = input("\nApprove? (yes/no): ")
        
        if approval.lower() == "yes":
            # resume the graph
            resumed = await graph.ainvoke(None, config)
            print("\n✅ Action completed:")
            print(resumed["messages"][-1].content)
            result["messages"].append(resumed["messages"][-1])
        else:
            print("\n❌ Action rejected — trade cancelled.")
            loop = False

asyncio.run(main())