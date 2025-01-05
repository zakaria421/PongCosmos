# def calculate_next_level(level, games_played):
#     """
#     Calculate the player's level based on the games played.
#     Each level requires progressively more games:
#     - Level 1: 1 game
#     - Level 2: 3 games
#     - Level 3: 6 games
#     - Level 4: 10 games, and so on.
#     """
#     # Calculate total games required to reach the current level
#     required_games_for_current_level = sum(i for i in range(1, int(level) + 1))
#     required_games_for_next_level = sum(i for i in range(1, int(level) + 2))

#     if games_played >= required_games_for_next_level:
#         # Level up if enough games are played
#         level = int(level) + 1
#         print(f"Level up! You are now level {level}.")
#     else:
#         # Calculate fractional progress within the current level
#         progress_within_level = (games_played - required_games_for_current_level) / (
#             required_games_for_next_level - required_games_for_current_level
#         )
#         level = int(level) + progress_within_level
#         print(f"Current progress: Level {level:.1f}.")

#     return level

# # Example usage
# # level = 0
# # games_played = 0

# # # Simulate playing games
# # for i in range(100):  # Simulate playing 15 games
# #     games_played += 1
# #     level = calculate_next_level(level, games_played)

# def calculate_next_level_loser(level, games_played):
#     """
#     Calculate the player's level based on games played for a loser.
#     Each level requires progressively more games, but progress is slower (e.g., 50% of a winner's points):
#     - Level 1: 1 game
#     - Level 2: 3 games
#     - Level 3: 6 games
#     - Level 4: 10 games, and so on.
#     """
#     # Calculate total games required to reach the current level
#     required_games_for_current_level = sum(i for i in range(1, int(level) + 1))
#     required_games_for_next_level = sum(i for i in range(1, int(level) + 2))

#     if games_played >= required_games_for_next_level:
#         # Level up if enough games are played
#         level = int(level) + 1
#         print(f"Level up (loser)! You are now level {level}.")
#     else:
#         # Calculate fractional progress within the current level
#         progress_within_level = (games_played - required_games_for_current_level) / (
#             required_games_for_next_level - required_games_for_current_level
#         )
#         # Reduce the fractional progress for losers (e.g., by 50%)
#         progress_within_level *= 0.5  # Adjust the factor for reduced progress
#         level = int(level) + progress_within_level
#         print(f"Current progress (loser): Level {level:.1f}.")

#     return level

# # Example usage for winners and losers
# def simulate_game_results():
#     winner_level = 0
#     loser_level = 0
#     games_played = 0

#     # Simulate 15 games
#     for i in range(15):
#         games_played += 1
#         print(f"\nGame {i + 1}:")
#         # Update winner's level
#         winner_level = calculate_next_level(winner_level, games_played)
#         # Update loser's level
#         loser_level = calculate_next_level_loser(loser_level, games_played)

import math

def calculate_next_level(level, games_played):
    """
    Calculate the player's level based on games played as a winner.
    Winning increases progress faster.
    """
    required_games_for_current_level = sum(i for i in range(1, math.floor(level) + 1))
    required_games_for_next_level = sum(i for i in range(1, math.floor(level) + 2))

    if games_played >= required_games_for_next_level:
        level = math.floor(level) + 1
        print(f"Level up! You are now level {level}.")
    else:
        progress_within_level = (games_played - required_games_for_current_level) / (
            required_games_for_next_level - required_games_for_current_level
        )
        level = math.floor(level) + progress_within_level
        print(f"Current progress: Level {level:.2f}.")

    return level

def calculate_next_level_loser(level, games_played):
    """
    Calculate the player's level based on games played as a loser.
    Losing increases progress more slowly (e.g., at 50% efficiency).
    """
    required_games_for_current_level = sum(i for i in range(1, math.floor(level) + 1))
    required_games_for_next_level = sum(i for i in range(1, math.floor(level) + 2))

    # Calculate the effective progress of the loser
    effective_progress = (games_played * 0.5)  # Slower progress, 50% efficiency

    # Check if the effective progress allows for a level up
    if effective_progress >= required_games_for_next_level:
        level = math.floor(level) + 1
        print(f"Level up (loser)! You are now level {level}.")
    else:
        # Calculate progress within the current level
        if effective_progress >= required_games_for_current_level:
            progress_within_level = (effective_progress - required_games_for_current_level) / (
                required_games_for_next_level - required_games_for_current_level
            )
            level = math.floor(level) + progress_within_level
        else:
            level = math.floor(level)  # Keep the level the same if not enough progress

        print(f"Current progress (loser): Level {level:.2f}.")

    return level


# Simulate games for winners and losers
# def simulate_game_results():
#     winner_level = 0
#     loser_level = 1.5
#     winner_games_played = 0
#     loser_games_played = 2

#     # Simulate 15 games
#     for i in range(1):
#         print(f"\nGame {i + 1}:")
#         # Winner progresses
#         winner_games_played += 1
#         winner_level = calculate_next_level(winner_level, winner_games_played)

#         # Loser progresses slowly
#         loser_games_played += 1
#         loser_level = calculate_next_level_loser(loser_level, loser_games_played)


# Run the simulation
# simulate_game_results()

import math

def calculate_xp(level, games_played, is_winner):
    """
    Calculate the XP based on games played.
    Winners gain XP faster than losers.
    """
    if is_winner:
        return games_played * 2  # Winners gain 2 XP per game
    else:
        return games_played * 0.5  # Losers gain 0.5 XP per game

def calculate_level(xp):
    """
    Calculate the player's level based on total XP.
    The level is determined by the total XP accumulated.
    """
    level = 0
    required_xp = 0
    while xp >= required_xp:
        level += 1
        required_xp += level  # Level 1 requires 1 XP, Level 2 requires 2 XP, etc.
    return level - 1  # Subtract 1 because we incremented one extra in the loop

def simulate_game_results():
    winner_level = 0
    loser_level = 1
    winner_xp = 0
    loser_xp = 3

    # Simulate 15 games
    for i in range():
        print(f"\nGame {i + 1}:")
        
        # Calculate games played as i + 1
        games_played = i + 1
        
        # Winner progresses
        winner_xp = calculate_xp(winner_level, games_played, True)
        winner_level = calculate_level(winner_xp)
        print(f"Winner's Level: {winner_level}")

        # Loser progresses
        loser_xp = calculate_xp(loser_level, games_played, False)
        loser_level = calculate_level(loser_xp)
        print(f"Loser's Level: {loser_level}")

# Run the simulation
simulate_game_results()

