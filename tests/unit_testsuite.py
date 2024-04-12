import asyncio
import pytest
import sys
from os.path import dirname, abspath
from scipy.stats import norm

sys.path.append(dirname(dirname(abspath(__file__)))+'/server')
from models import Bot, BotDifficulty, Action, ActionEnum
from generate_dict import load_dict, DICT_PATH, EASY_DICT_PATH, MED_DICT_PATH, HARD_DICT_PATH
import random

NUM_BOT_RUNS = 100
TIMER_SETTING = 25.0
BOARD_SIZE = 10

# here we generate the boards the same way we do in-game
# https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
letter_weights = {
    'E': 11.1607, 'A': 8.4966, 'R': 7.5809, 'I': 7.5448, 'O': 7.1635,
    'T': 6.9509, 'N': 6.6544, 'S': 5.7351, 'L': 5.4893, 'C': 4.5388,
    'U': 3.6308, 'D': 3.3844, 'P': 3.1671, 'M': 3.0129, 'H': 3.0034,
    'G': 2.4705, 'B': 2.0720, 'F': 1.8121, 'Y': 1.7779, 'W': 1.2899,
    'K': 1.1016, 'V': 1.0074, 'X': 0.2902, 'Z': 0.2722, 'J': 0.1965,
    'Q': 0.1962
}
letters, weights = zip(*letter_weights.items())
def rand_letter():
    return random.choices(letters, weights=weights, k=1)[0]
def rand_board(N):
    return [[rand_letter() for i in range(N)] for i in range(N)]
async def get_bot_failure_rate(difficulty: BotDifficulty):
    bot = Bot("id", "bot", difficulty, lambda _, a, _1 : bot_msg_log.append(a))
    async def bot_find_word():
        loop = asyncio.get_event_loop()
        bot.process_bot_action(Action(ActionEnum.START_GAME, "id", {'timer_setting': TIMER_SETTING}))
        game_state = {"state": {"curr_turn": "id", "board": rand_board(BOARD_SIZE), "timer": 123.4, "memory": []}, "max_lives": 5, "host": "yWAcqGFzYt", "board_size": 4, "timer_setting": 25.0, "lobby_code": "ZJXF", "players": [{"id": "yWAcqGFzYt", "name": "Alice", "is_spectator": False, "is_bot": False, "lives": 3, "money": 0, "score": 0}, {"id": "id", "name": "Bob", "is_spectator": False, "is_bot": True, "lives": 3, "money": 0, "score": 0}]}
        await loop.run_in_executor(None, bot.process_bot_action, Action(ActionEnum.START_TURN, "id", game_state))

    bot_msg_log = []
    tasks = [None]*NUM_BOT_RUNS
    for i in range(NUM_BOT_RUNS):
        tasks[i]=asyncio.create_task(bot_find_word())
    await asyncio.gather(*tasks)
    cnt_found_words = len([log.value for log in bot_msg_log if log==ActionEnum.PICK_WORD])
    # cnt_failed = len([log.value for log in bot_msg_log if log==ActionEnum.END_TURN])
    print(f"bot has {100*cnt_found_words/len(bot_msg_log)}% success rate")
    return 100*cnt_found_words/len(bot_msg_log)

def test_dictionary():
    dictionary = load_dict(DICT_PATH)
    scowl = load_dict("scowl.txt")
    for s in dictionary:
        assert s.isalpha()
    assert set(scowl).issuperset(set(dictionary))

def test_bots_vocab():
    dictionary = load_dict(EASY_DICT_PATH)
    scowl = load_dict("scowl.txt")
    for s in dictionary:
        assert s.isalpha()
    assert set(scowl).issuperset(set(dictionary))

def test_easy_med_bot_vocab_comparison():
    easy_dict = load_dict(EASY_DICT_PATH)
    med_dict = load_dict(MED_DICT_PATH)
    assert len(med_dict)>len(easy_dict)

def test_med_hard_bot_vocab_comparison():
    med_dict = load_dict(MED_DICT_PATH)
    hard_dict = load_dict(HARD_DICT_PATH)
    assert len(hard_dict)>len(med_dict)


# Expected percentage of successes
BOT_FAIL_PROBABILITY = (0.25, 0.18, 0.10)
p_easy = 1 - BOT_FAIL_PROBABILITY[0]
p_medium = 1 - BOT_FAIL_PROBABILITY[1]
p_hard = 1 - BOT_FAIL_PROBABILITY[2]
standard_error_easy = (p_easy * (1 - p_easy) / NUM_BOT_RUNS) ** 0.5
standard_error_medium = (p_medium * (1 - p_medium) / NUM_BOT_RUNS) ** 0.5
standard_error_hard = (p_hard * (1 - p_hard) / NUM_BOT_RUNS) ** 0.5
z = norm.ppf(0.995)  # Z-score for 99% confidence
confidence_interval_easy = (p_easy - z * standard_error_easy, p_easy + z * standard_error_easy)
confidence_interval_medium = (p_medium - z * standard_error_medium, p_medium + z * standard_error_medium)
confidence_interval_hard = (p_hard - z * standard_error_hard, p_hard + z * standard_error_hard)
print(confidence_interval_easy, confidence_interval_medium, confidence_interval_hard)

@pytest.mark.asyncio
async def test_easy_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.EASY)
    assert confidence_interval_easy[0] <=success_rate/100<= confidence_interval_easy[1]

@pytest.mark.asyncio
async def test_medium_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.MEDIUM)
    assert confidence_interval_medium[0]<=success_rate/100<=confidence_interval_medium[1]

@pytest.mark.asyncio
async def test_hard_bot():
    success_rate = await get_bot_failure_rate(BotDifficulty.HARD)
    assert confidence_interval_hard[0]<=success_rate/100<=confidence_interval_hard[1]

# Run the test
# py -m pytest unit_testsuite.py

# otherwise
# asyncio.run(test_easy_bot())
# asyncio.run(test_medium_bot())
# asyncio.run(test_hard_bot())