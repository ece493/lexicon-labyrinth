PLAYER_LIMIT = 5

class Lobby:
    def __init__(self, lobby_id, host) -> None:
        self.lobby_id = lobby_id
        self.host = host
        self.players = []
        self.is_in_game = False

    @property
    def is_full(self) -> bool:
        return len(self.players) >= PLAYER_LIMIT

    def add_player(self, player) -> bool:
        success = False
        if not self.is_full:
            self.players.append(player)
            print(f"Player {player} added to lobby {self.lobby_id}.")
            success = True
        else:
            print(f"Lobby {self.lobby_id} is full. Cannot add player {player}.")

        if self.is_full:
            print(f"Lobby {self.lobby_id} is now full.")
        return success
