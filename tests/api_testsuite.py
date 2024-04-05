import asyncio
import websockets
import json

URL = "ws://localhost:8888/websocket"

send_recv_A = [
    ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
    ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
    ({"action": "pick_word", "data": [[1, 0], [2, 0], [2, 1], [3, 1]], "sequence_number": 2}, ["word_accepted", "word_denied"])
]

send_recv_B = [
    ({"action": "join_lobby", "data": {"player_name": "Bob"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
]

async def send_and_check_rcv(websocket, message, player_id, actions):
    await asyncio.sleep(1)
    message["player_id"] = player_id
    await websocket.send(json.dumps(message))
    ret = None
    try:
        while True:
            response = await asyncio.wait_for(websocket.recv(), timeout=1)
            print(f"Received: {response}")
            loaded = json.loads(response)
            if loaded["player_id"] == player_id and loaded["action"] in actions:
                ret = response
    except asyncio.TimeoutError:
        return ret

async def basic_lobby_interaction(url):
    async with websockets.connect(url) as websocket_A, websockets.connect(url) as websocket_B:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        init_B = await asyncio.wait_for(websocket_B.recv(), timeout=5)
        init_B = json.loads(init_B)
        player_id_B = init_B["player_id"]
        print(player_id_B)

        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1])
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        await send_and_check_rcv(websocket_B, send_recv_B[0][0], player_id_B, send_recv_B[0][1])
        await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1])
        await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1])

async def test_lobby_interaction():
    await asyncio.create_task(basic_lobby_interaction(URL))

# Run the test
asyncio.run(test_lobby_interaction())
