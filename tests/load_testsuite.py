import asyncio
import websockets
import json
from api_testsuite import two_players_play_till_death, make_one_move, URL

# Load Tests
CONCURRENT_LOBBIES = 20
TIME_OUT = 3
WAIT_TIME = 5

async def test_lobby_interaction():
    # we divide by two since each workflow creates two players
    tasks = [None]*(CONCURRENT_LOBBIES)
    for i in range(CONCURRENT_LOBBIES):
        tasks[i]=asyncio.create_task(make_one_move(URL, TIME_OUT, WAIT_TIME))
    await asyncio.gather(*tasks)

async def test_two_players_play_till_death():
    # we divide by two since each workflow creates two players
    tasks = [None]*(CONCURRENT_LOBBIES)
    for i in range(CONCURRENT_LOBBIES):
        tasks[i]=asyncio.create_task(two_players_play_till_death(URL, TIME_OUT, WAIT_TIME))
    await asyncio.gather(*tasks)

# Run the test
# asyncio.run(test_lobby_interaction())
asyncio.run(test_two_players_play_till_death())