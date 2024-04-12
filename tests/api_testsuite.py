import asyncio
import websockets
import json
import pytest
import random

URL = "ws://localhost:8888/websocket"
TIME_OUT = 2
WAIT_TIME = 0.5

async def send_and_check_rcv(websocket, message, player_id, actions, time_out, wait_time):
    await asyncio.sleep(random.random()*wait_time*2) #random waits to simulate user interactions
    if message is not None:
        message["player_id"] = player_id
        await websocket.send(json.dumps(message))
    ret = None
    try:
        while True:
            response = await asyncio.wait_for(websocket.recv(), timeout=time_out)
            print(f"Received: {response}")
            loaded = json.loads(response)
            if loaded["player_id"] == player_id and loaded["action"] in actions:
                ret = response
    except asyncio.TimeoutError:
        pass
    return ret

async def make_one_move(url, time_out, wait_time):
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

        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time)
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        assert await send_and_check_rcv(websocket_B, send_recv_B[0][0], player_id_B, send_recv_B[0][1], time_out, wait_time) is not None
        assert await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1], time_out, wait_time) is not None
        assert await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1], time_out, wait_time) is not None

async def two_players_play_till_death(url, time_out, wait_time):
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
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        
        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time)
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        a_idx += 1
        
        assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
        b_idx += 1
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        for i in range(5): #each iteration reduces live by one
            assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
            assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
            a_idx += 1
            b_idx += 1

async def two_players_and_bot_play_till_death(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "change_param", "data": {"max_lives": 5}, "sequence_number": 0}, ["update_lobby_settings"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
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
        (None, ["you_died"])
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
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        
        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time)
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        a_idx += 1
        
        assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
        b_idx += 1
        # add bot
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        for i in range(5): #each iteration reduces live by one
            assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
            assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
            a_idx += 1
            b_idx += 1

# base_difficulty can be 0 or 1
async def one_player_and_two_bots_play(url, time_out, wait_time, base_difficulty=0):
    send_recv = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "update_bot", "data": {"difficulty": base_difficulty}, "sequence_number": 0}, ["update_bot"]),
        ({"action": "update_bot", "data": {"difficulty": base_difficulty+1}, "sequence_number": 0}, ["update_bot"]),
        ({"action": "change_param", "data": {"timer_setting": 5}, "sequence_number": 0}, ["update_lobby_settings"]),
        ({"action": "ready_lobby", "sequence_number": 0}, ["start_game"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["lose_life"]),
        ({"action": "end_turn", "data": None, "sequence_number": 0}, ["you_died"]),
    ]
    async with websockets.connect(url) as websocket:
        init = await asyncio.wait_for(websocket.recv(), timeout=5)
        init = json.loads(init)
        player_id = init["player_id"]
        print(player_id)

        idx = 0
        assert await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time) is not None
        idx += 1
        
        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], 2*time_out, 2*wait_time)
        resp = json.loads(resp)
        bot_a_id = resp["data"]["lobby"]["players"][1]["id"]
        idx += 1

        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], 2*time_out, 2*wait_time)
        resp = json.loads(resp)
        bot_b_id = resp["data"]["lobby"]["players"][2]["id"]
        idx += 1
        send_recv[2][0]["data"]["player_id"] = bot_a_id
        send_recv[3][0]["data"]["player_id"] = bot_b_id
        
        for i in range(idx, len(send_recv)):
            assert await send_and_check_rcv(websocket, send_recv[i][0], player_id, send_recv[i][1], time_out, wait_time) is not None

async def lobby_owner_leaves(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "change_param", "data": {"timer_setting": 5}, "sequence_number": 0}, ["update_lobby_settings"]),
    ]
    send_recv_B = [
        ({"action": "join_lobby", "data": {"player_name": "Bob"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        (None, ["player_left"])
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
        assert await send_and_check_rcv(websocket_A, send_recv_A[a_idx][0], player_id_A, send_recv_A[a_idx][1], time_out, wait_time) is not None
        a_idx += 1
        
        lobbyResp = await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time)
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby_code"]
        send_recv_B[0][0]["data"]["lobby_code"] = lobbyCode
        a_idx += 1
        
        assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
        b_idx += 1
        websocket_A.close()
        
        assert await send_and_check_rcv(websocket_B, send_recv_B[b_idx][0], player_id_B, send_recv_B[b_idx][1], time_out, wait_time) is not None
        # resp = json.loads(resp)
        # assert resp["pla"]
        

async def remove_a_bot(url, time_out, wait_time):
    send_recv = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "remove_player", "data": {}, "sequence_number": 0}, ["remove_player"]),
    ]
    async with websockets.connect(url) as websocket:
        init = await asyncio.wait_for(websocket.recv(), timeout=5)
        init = json.loads(init)
        player_id = init["player_id"]
        print(player_id)

        idx = 0
        assert await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time) is not None
        idx += 1
        
        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time)
        resp = json.loads(resp)
        lobbyCode = resp["data"]["lobby"]["lobby_code"]
        bot_a_id = resp["data"]["lobby"]["players"][1]["id"]
        idx += 1

        send_recv[idx][0]["data"]["player_id"] = bot_a_id
        send_recv[idx][0]["data"]["lobby_code"] = lobbyCode
        
        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time)
        resp = json.loads(resp)
        assert len(resp["data"]["lobby"]["players"]) == 1


async def change_lobby_params(url, time_out, wait_time):
    send_recv = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "change_param", "data": {"timer_setting": 14}, "sequence_number": 0}, ["update_lobby_settings"]),
        ({"action": "change_param", "data": {"max_lives": 7}, "sequence_number": 0}, ["update_lobby_settings"]),
        ({"action": "change_param", "data": {"board_size": 8}, "sequence_number": 0}, ["update_lobby_settings"]),
    ]
    async with websockets.connect(url) as websocket:
        init = await asyncio.wait_for(websocket.recv(), timeout=5)
        init = json.loads(init)
        player_id = init["player_id"]
        print(player_id)

        idx = 0
        assert await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time) is not None
        idx += 1
        
        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time)
        resp = json.loads(resp)
        assert resp["data"]["lobby"]["timer_setting"]==14
        idx += 1

        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time)
        resp = json.loads(resp)
        assert resp["data"]["lobby"]["max_lives"]==7
        idx += 1

        resp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time)
        resp = json.loads(resp)
        assert resp["data"]["lobby"]["board_size"]==8
        idx += 1

async def full_lobby(url, time_out, wait_time):
    send_recv = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
        # ({"action": "add_bot", "data": {}, "sequence_number": 0}, ["add_bot"]),
    ]
    async with websockets.connect(url) as websocket, websockets.connect(url) as websocket1:
        init = await asyncio.wait_for(websocket.recv(), timeout=5)
        init = json.loads(init)
        player_id = init["player_id"]
        print(player_id)

        init1 = await asyncio.wait_for(websocket1.recv(), timeout=5)
        init1 = json.loads(init1)
        player_id1 = init1["player_id"]
        print(player_id1)

        idx = 0
        assert await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], time_out, wait_time) is not None
        idx += 1
        
        lobbyResp = await send_and_check_rcv(websocket, send_recv[idx][0], player_id, send_recv[idx][1], 2*time_out, 2*wait_time)
        lobbyResp = json.loads(lobbyResp)
        lobbyCode = lobbyResp["data"]["lobby"]["lobby_code"]
        idx += 1
        
        for i in range(idx, len(send_recv)):
            assert await send_and_check_rcv(websocket, send_recv[i][0], player_id, send_recv[i][1], time_out, wait_time) is not None
        bobJoinReq = {"action": "join_lobby", "data": {"player_name": "Bob", "lobby_code": lobbyCode}, "sequence_number": 0}
        assert await send_and_check_rcv(websocket, bobJoinReq, player_id, ["lobby_is_full"], time_out, wait_time) is not None


async def use_rotate(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
        ({"action": "pick_rotate_powerup", "data": {"type": "row", "index": 0, "rotations": 1}, "sequence_number": 2}, ["rotate_powerup_accept"])
    ]
    
    async with websockets.connect(url) as websocket_A:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time) 
        lobby_resp =  await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1], time_out, wait_time)
        original_row = json.loads(lobby_resp)["data"]["state"]["board"][0]
        expected_row = [original_row [len(original_row) - 1]]
        expected_row = expected_row + original_row[0:len(original_row) - 1]
        
        p_lobby_resp = await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1], time_out, wait_time)

        recv_row = json.loads(p_lobby_resp)["data"]["lobby"]["state"]["board"][0]
        
        assert recv_row == expected_row
    
async def use_scramble(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
        ({"action": "pick_scramble_powerup", "data": {"type": "row", "index": 0, "rotations": 1}, "sequence_number": 2}, ["scramble_powerup_accept"])
    ]
    
    async with websockets.connect(url) as websocket_A:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time) 
        lobby_resp =  await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1], time_out, wait_time)
        original_board = json.loads(lobby_resp)["data"]["state"]["board"]
        
        p_lobby_resp = await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1], time_out, wait_time)

        recv_board = json.loads(p_lobby_resp)["data"]["lobby"]["state"]["board"]
        
        boards_equal = True
        for i in range(len(original_board)):
            for j in range(len(original_board[0])):
                if not boards_equal:
                    break
                if original_board[i][j] != recv_board[i][j]:
                    boards_equal = False
                    break
        
        assert boards_equal == False


async def use_swap(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
        ({"action": "pick_swap_powerup", "data": {"tiles": [[0, 0], [1, 0]]}, "sequence_number": 2}, ["swap_powerup_accept"])
    ]
    
    async with websockets.connect(url) as websocket_A:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time) 
        lobby_resp =  await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1], time_out, wait_time)
        original_row = json.loads(lobby_resp)["data"]["state"]["board"][0]
        expected_row = [original_row [1], original_row [0]]
        expected_row = expected_row + original_row[2:len(original_row)]
        
        p_lobby_resp = await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1], time_out, wait_time)

        recv_row = json.loads(p_lobby_resp)["data"]["lobby"]["state"]["board"][0]
        
        assert recv_row == expected_row
        
async def use_transform(url, time_out, wait_time):
    send_recv_A = [
        ({"action": "initialize", "data": {"player_name": "Alice"}, "sequence_number": 0}, ["successfully_joined_lobby"]),
        ({"action": "ready_lobby", "sequence_number": 1}, ["start_game"]),
        ({"action": "pick_transform_powerup", "data": {"tile": [0, 0], "new_char": "X"}, "sequence_number": 2}, ["transform_powerup_accept"])
    ]
    
    async with websockets.connect(url) as websocket_A:
        init_A = await asyncio.wait_for(websocket_A.recv(), timeout=5)
        init_A = json.loads(init_A)
        player_id_A = init_A["player_id"]
        print(player_id_A)

        await send_and_check_rcv(websocket_A, send_recv_A[0][0], player_id_A, send_recv_A[0][1], time_out, wait_time) 
        await send_and_check_rcv(websocket_A, send_recv_A[1][0], player_id_A, send_recv_A[1][1], time_out, wait_time)
    
        expected_val = "X"

        p_lobby_resp = await send_and_check_rcv(websocket_A, send_recv_A[2][0], player_id_A, send_recv_A[2][1], time_out, wait_time)
        recv_val = json.loads(p_lobby_resp)["data"]["lobby"]["state"]["board"][0][0]
        
        assert expected_val == recv_val

@pytest.mark.asyncio
async def test_lobby_interaction():
    await asyncio.create_task(make_one_move(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_game_until_end():
    await asyncio.create_task(two_players_play_till_death(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_two_players_and_bot_play_till_death():
    await asyncio.create_task(two_players_and_bot_play_till_death(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_full_lobby():
    await asyncio.create_task(full_lobby(URL, TIME_OUT, WAIT_TIME))

# @pytest.mark.asyncio
# async def test_one_player_and_two_bots_play_till_death():
#     await asyncio.create_task(one_player_and_two_bots_play(URL, 2*TIME_OUT, 2*WAIT_TIME))
    
@pytest.mark.asyncio
async def test_use_rotate():
    await asyncio.create_task(use_rotate(URL, TIME_OUT, WAIT_TIME))
    
@pytest.mark.asyncio
async def test_use_scramble():
    await asyncio.create_task(use_scramble(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_use_transform():
    await asyncio.create_task(use_transform(URL, TIME_OUT, WAIT_TIME))
    
@pytest.mark.asyncio
async def test_use_swap():
    await asyncio.create_task(use_swap(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_change_lobby_params():
    await asyncio.create_task(change_lobby_params(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_remove_a_bot():
    await asyncio.create_task(remove_a_bot(URL, TIME_OUT, WAIT_TIME))

@pytest.mark.asyncio
async def test_lobby_owner_leaves():
    await asyncio.create_task(lobby_owner_leaves(URL, TIME_OUT, WAIT_TIME))

# Run the test
# py -m pytest api_testsuite.py

# otherwise
# asyncio.run(test_lobby_interaction())
# asyncio.run(test_game_until_end())
# asyncio.run(test_one_player_and_two_bots_play_till_death())
# asyncio.run(test_full_lobby())