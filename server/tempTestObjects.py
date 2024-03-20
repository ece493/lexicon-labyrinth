host = {
    "id": "0",
    "name": "John Player",
    "is_spectator": False,
    "lives": 3,
    "money": 100,
}
p2 = {
    "id": "1",
    "name": "P2",
    "is_spectator": False,
    "lives": 3,
    "money": 100,
}

richP2 = {
    "id": "1",
    "name": "P2",
    "is_spectator": False,
    "lives": 3,
    "money": 1000,
}
dead = {
    "id": "2",
    "name": "Dead man walking",
    "is_spectator": False,
    "lives": 0,
    "money": 100,
}
bot = {
    "id": "3",
    "name": "John Bot",
    "is_spectator": False,
    "lives": 3,
    "money": 100,
    "difficulty": 1,
    "memory": [],
}

lobby1 = {
    "state": {
        "curr_turn": "1",
        "board": {
            "tiles": [
                ["N", "b", "c", "d", "e", "f", "g"],
                ["h", "N", "j", "k", "l", "m", "n"],
                ["o", "p", "N", "r", "s", "t", "u"],
                ["v", "w", "x", "y", "z", "A", "B"],
                ["C", "D", "E", "F", "G", "H", "I"],
                ["J", "K", "L", "M", "N", "O", "P"],
                ["Q", "R", "S", "T", "U", "V", "W"],
            ],
        },
        "timer": 0,
        "memory": [],
    },
    "max_lives": 5,
    "host": 0,
    "board_size": [7, 7],
    "timer_setting": 30,
    "lobby_code": "X3Y0EG",
    "players": [host, richP2, dead, bot],
}

newTurnLobby = {
    "state": {
        "curr_turn": "3",
        "board": {
            "tiles": [
                ["N", "b", "c", "d", "e", "f", "g"],
                ["h", "N", "j", "k", "l", "m", "n"],
                ["o", "p", "N", "r", "s", "t", "u"],
                ["v", "w", "x", "y", "z", "A", "B"],
                ["C", "D", "E", "F", "G", "H", "I"],
                ["J", "K", "L", "M", "N", "O", "P"],
                ["Q", "R", "S", "T", "U", "V", "W"],
            ],
        },
        "timer": 0,
        "memory": [],
    },
    "max_lives": 5,
    "host": 0,
    "board_size": [7, 7],
    "timer_setting": 30,
    "lobby_code": "X3Y0EG",
    "players": [host, richP2, dead, bot],
}

class StaticTestObjects:
    def getAcceptedWordLobby():
        return lobby1
    
    def getNewTurnLobby():
        return newTurnLobby
