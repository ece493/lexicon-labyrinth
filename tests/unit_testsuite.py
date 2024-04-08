import asyncio
import pytest
import sys
from os.path import dirname, abspath

sys.path.append(dirname(dirname(abspath(__file__)))+'/server')
from models import Bot, BotDifficulty, Action, ActionEnum

NUM_BOT_RUNS = 100
TIMER_SETTING = 2.5

async def get_bot_failure_rate(difficulty: BotDifficulty):
    async def bot_find_word(bot_msg_log):
        loop = asyncio.get_event_loop()
        bot = Bot("id", "bot", difficulty, lambda _, a, _1 : bot_msg_log.append(a))
        bot.process_bot_action(Action(ActionEnum.START_GAME.value, "id", {'timer_setting': TIMER_SETTING}))
        game_state = {"state": {"curr_turn": "id", "board": [["P", "B", "I", "U"], ["G", "C", "T", "E"], ["T", "S", "B", "W"], ["T", "H", "R", "P"]], "timer": 123.4, "memory": []}, "max_lives": 5, "host": "yWAcqGFzYt", "board_size": 4, "timer_setting": 5.0, "lobby_code": "ZJXF", "players": [{"id": "yWAcqGFzYt", "name": "Alice", "is_spectator": False, "is_bot": False, "lives": 3, "money": 0, "score": 0}, {"id": "id", "name": "Bob", "is_spectator": False, "is_bot": True, "lives": 3, "money": 0, "score": 0}]}
        await loop.run_in_executor(None, bot.process_bot_action, Action(ActionEnum.START_TURN.value, "id", game_state))

    bot_msg_log = []
    tasks = [None]*NUM_BOT_RUNS
    for i in range(NUM_BOT_RUNS):
        tasks[i]=asyncio.create_task(bot_find_word(bot_msg_log))
    await asyncio.gather(*tasks)
    cnt_found_words = len([log.value for log in bot_msg_log if log==ActionEnum.PICK_WORD])
    # cnt_failed = len([log.value for log in bot_msg_log if log==ActionEnum.END_TURN])
    print(f"bot has {cnt_found_words/len(bot_msg_log)}% success rate")
    return 100*cnt_found_words/len(bot_msg_log)

@pytest.mark.asyncio
async def test_easy_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.EASY)
    assert 65<=success_rate<=85

@pytest.mark.asyncio
async def test_medium_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.MEDIUM)
    assert 80<=success_rate<=100

@pytest.mark.asyncio
async def test_hard_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.HARD)
    assert 85<=success_rate<=100

# Run the test
# py -m pytest unit_testsuite.py

# otherwise
# asyncio.run(test_easy_bot())
# asyncio.run(test_medium_bot())
# asyncio.run(test_hard_bot())