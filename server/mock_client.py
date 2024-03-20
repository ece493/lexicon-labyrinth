import asyncio
import websockets
import json

uri = "ws://localhost:8888/websocket"

async def player_actions(websocket, player_name, actions, listen_count):
    print(f"{player_name}: Connected to the server.")
    
    # Send actions
    for action in actions:
        await websocket.send(json.dumps(action))
        print(f"{player_name} sent: {action}")
        await asyncio.sleep(1)  # Short delay to mimic real user interaction

    # Listen for responses
    for _ in range(listen_count):
        response = await websocket.recv()
        print(f"{player_name} received: {response}")

async def player_1_routine(uri):
    async with websockets.connect(uri) as websocket:
        await player_actions(websocket, "Player 1", [{'action': "initialize"}], 6)  # 3 listens: ID, lobby code, player 2 join

async def player_2_routine(uri):
    await asyncio.sleep(1)  # Delay to ensure Player 1 sends messages first
    async with websockets.connect(uri) as websocket:
        # Replace 'ABCD' with the actual lobby code Player 1 received
        await player_actions(websocket, "Player 2", [{'action': "join_lobby", 'data': "ABCD"}], 6)  # 2 listens: ID, join confirmation

async def test_lobby_interaction():
    # Launch both player routines
    player_1_task = asyncio.create_task(player_1_routine(uri))
    player_2_task = asyncio.create_task(player_2_routine(uri))
    
    # Wait for both players to finish their routines
    await player_1_task
    await player_2_task

# Run the test
asyncio.run(test_lobby_interaction())
