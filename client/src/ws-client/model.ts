// FR33 - Powerup.Rotate, FR35 - Powerup.Swap ,FR36 - Powerup.Transform, FR34 - Powerup.Refresh, FR17 - Tile.Drag
export enum ActionsList {
    // Client Actions
    initialize = "initialize",
    join_lobby = "join_lobby",
    change_param = "change_param",
    add_bot = "add_bot",
    update_bot = "update_bot",
    remove_player = "remove_player",
    ready_lobby = "ready_lobby",
    pick_word = "pick_word",
    pick_rotate_powerup = "pick_rotate_powerup",
    pick_scramble_powerup = "pick_scramble_powerup",
    pick_swap_powerup = "pick_swap_powerup",
    pick_transform_powerup = "pick_transform_powerup",
    leave_game = "leave_game",
    lose_life = "lose_life",
    // Server Actions
    return_lobby_code = "return_lobby_code",
    return_player_id = "return_player_id",
    lobby_does_not_exist = "lobby_does_not_exist",
    lobby_full = "lobby_is_full", 
    successfully_joined_lobby = "successfully_joined_lobby",
    success = "success",
    error = "error",
    start_game = "start_game",
    player_joined = "player_joined",
    player_left = "player_left",
    update_lobby_settings = "update_lobby_settings",
    word_accepted = "word_accepted",
    word_denied = "word_denied",
    end_turn = "end_turn",
    start_turn = "start_turn",
    powerup_denied = "powerup_denied",
    rotate_powerup_accept = "rotate_powerup_accept",
    scramble_powerup_accept = "scramble_powerup_accept",
    swap_powerup_accept = "swap_powerup_accept",
    transform_powerup_accept = "transform_powerup_accept",
    you_died = "you_died",
    you_win = "you_win",
}
