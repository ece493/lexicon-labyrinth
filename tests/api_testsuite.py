import asyncio
import websockets
import json
import random

URL = "ws://localhost:8888/websocket"
TIME_OUT = 3
WAIT_TIME = 5

async def send_and_check_rcv(websocket, message, player_id, actions):
    await asyncio.sleep(random.random()*WAIT_TIME*2) #random waits to simulate user interactions
    if message is not None:
        message["player_id"] = player_id
        await websocket.send(json.dumps(message))
    ret = None
    try:
        while True:
            response = await asyncio.wait_for(websocket.recv(), timeout=TIME_OUT)
            print(f"Received: {response}")
            loaded = json.loads(response)
            if loaded["player_id"] == player_id and loaded["action"] in actions:
                ret = response
    except asyncio.TimeoutError:
        return ret

async def make_one_move(url):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
        ({"action": "pick_word", "data": [[1, 0], [2, 0], [2, 1], [3, 1]], "sequence_number": 2}, ["word_accepted", "word_denied"])
    ]
    send_recv_B = [
        ({"action": "join_lobby", "data": {"player_name": "Bob"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
    ]
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
        assert await send_and_check_rcv(websocket_B, send_recv_B[0][0], player_id_B, send_recv_B[0][1]) is not None
        assert await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1]) is not None
        assert await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1]) is not None

async def two_players_play_till_death(url):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "change_param", "data": {"max_lives": 5}, "sequence_number": 0}, ["update_lobby_settings"]),
        ({"action": "ready_lobby", "sequence_number": 0}, ["start_game"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["you_died"])
    ]
    send_recv_B = [
        ({"action": "join_lobby", "data": {"player_name": "Bob"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        (None, ["you_win"])
    ]
    async with websockets.connect(url) as websocket_A, websockets.connect(url) as websocket_B:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        init_B = await asyncio.wait_for(websocket_B.recv(), timeout=5)
        init_B = json.loads(init_B)
        player_id_B = init_B["player_id"]
        print(player_id_B)

        a_idx = 0
        b_idx = 0
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1]) is not None
        a_idx += 1
        
        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1])
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        a_idx += 1
        
        assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1]) is not None
        b_idx += 1
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1]) is not None
        a_idx += 1
        for i in range(5): #each iteration reduces live by one
            assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1]) is not None
            assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1]) is not None
            a_idx += 1
            b_idx += 1


async def test_lobby_interaction():
    await asyncio.create_task(make_one_move(URL))

async def test_game_until_end():
    await asyncio.create_task(two_players_play_till_death(URL))

# Run the test
asyncio.run(test_lobby_interaction())
asyncio.run(test_game_until_end())