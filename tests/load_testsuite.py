import asyncio
import pytest
from api_testsuite import two_players_play_till_death, make_one_move, URL

# Load Tests
CONCURRENT_LOBBIES = 10
TIME_OUT = 1
WAIT_TIME = 5

@pytest.mark.asyncio
async def test_lobby_interaction():
    tasks = [None]*(CONCURRENT_LOBBIES)
    for i in range(CONCURRENT_LOBBIES):
        tasks[i]=asyncio.create_task(make_one_move(URL, TIME_OUT, WAIT_TIME))
    await asyncio.gather(*tasks)

@pytest.mark.asyncio
async def test_many_two_players_play_till_death():
    tasks = [None]*(CONCURRENT_LOBBIES)
    for i in range(CONCURRENT_LOBBIES):
        tasks[i]=asyncio.create_task(two_players_play_till_death(URL, TIME_OUT, WAIT_TIME))
    await asyncio.gather(*tasks)

# Run the test
# py -m pytest load_testsuite.py

# otherwise
# asyncio.run(test_lobby_interaction())
# asyncio.run(test_two_players_play_till_death())