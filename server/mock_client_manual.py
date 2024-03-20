import asyncio
import websockets
import json
import aioconsole

uri = "ws://localhost:8888/websocket"

async def listen_for_messages(websocket):
    try:
        async for message in websocket:
            print("\nReceived from server:", message)
            # This will reintroduce the input prompt visually after a message is received.
            print("Enter command: ", end='', flush=True)  
    except websockets.exceptions.ConnectionClosed:
        print("\nConnection closed by the server.")
    except Exception as e:
        print(f"\nError listening for messages: {e}")

async def send_commands(websocket, player_id):
    print("\nYou can now manually input commands. Type 'exit' to quit.")
    while True:
        raw_input = await aioconsole.ainput("Enter command: ")
        if raw_input.lower() == 'exit':
            break

        try:
            action = json.loads(raw_input)
            action['player_id'] = player_id
            await websocket.send(json.dumps(action))
            print("Command sent, awaiting response...")
        except json.JSONDecodeError:
            print("Error: Command must be valid JSON. Try again.")
        except Exception as e:
            print(f"An error occurred: {e}")

async def manual_player_actions(uri):
    async with websockets.connect(uri) as websocket:
        print("Connected to the server. Awaiting player ID...")
        
        player_id = None
        while player_id is None:
            response = await websocket.recv()
            message = json.loads(response)
            if message['action'] == "return_player_id":
                player_id = message['data']
                print(f"Assigned Player ID: {player_id}")
            else:
                print("Unexpected message received, waiting for player ID...")

        # Run listener and sender concurrently
        listener_task = asyncio.create_task(listen_for_messages(websocket))
        sender_task = asyncio.create_task(send_commands(websocket, player_id))

        await asyncio.gather(listener_task, sender_task)

# Run the test client
asyncio.run(manual_player_actions(uri))
