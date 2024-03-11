

class Lobby:
    def __init__(self, lobby_id, host) -> None:
        self.lobby_id = lobby_id
        self.host = host
        self.players = []
        self.is_full = False
        self.is_in_game = False

    def add_player(self, player) -> None:
        if not self.is_full:
            self.players.append(player)
            # Additional logic to check if lobby is full or whether the game can start
