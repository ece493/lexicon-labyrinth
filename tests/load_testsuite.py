import asyncio
import websockets
import json
from api_testsuite import basic_lobby_interaction, URL

# Load Tests
CONCURRENT_PLAYERS = 30

async def test_lobby_interaction():
    # we divide by two since this workflow creates two players
    tasks = [None]*(CONCURRENT_PLAYERS//2)
    for i in range(CONCURRENT_PLAYERS//2):
        tasks[i]=asyncio.create_task(basic_lobby_interaction(URL))
    await asyncio.gather(*tasks)

# Run the test
asyncio.run(test_lobby_interaction())
