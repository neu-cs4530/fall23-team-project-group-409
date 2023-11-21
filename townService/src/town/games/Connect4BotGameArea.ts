import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  Connect4GameState,
  Connect4GridPosition,
  Connect4Move,
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  TicTacToeMove,
} from '../../types/CoveyTownSocket';
import Connect4Game from './Connect4Game';
import GameArea from './GameArea';

/**
 * A Connect4BotGameArea is a GameArea that hosts a Connect4Game with a bot.
 * @see Connect4Game
 * @see GameArea
 */
export default class Connect4BotGameArea extends GameArea<Connect4Game> {
  protected getType(): InteractableType {
    return 'Connect4Area';
  }

  private _bot: Player | undefined;

  private _stateUpdated(updatedState: GameInstance<Connect4GameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { yellow, red } = updatedState.state;
        if (yellow && red) {
          const yellowName =
            this._occupants.find(eachPlayer => eachPlayer.id === yellow)?.userName || yellow;
          const redName =
            this._occupants.find(eachPlayer => eachPlayer.id === red)?.userName || red;
          this._history.push({
            gameID,
            scores: {
              [yellowName]: updatedState.state.winner === yellow ? 1 : 0,
              [redName]: updatedState.state.winner === red ? 1 : 0,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // define a type guarding function to make sure moves passed aren't tictactoe moves
    const isConnect4Move = (m: TicTacToeMove | Connect4Move): m is Connect4Move =>
      m.gamePiece === 'Yellow' || m.gamePiece === 'Red';
    if (command.type === 'GameMove' && isConnect4Move(command.move)) {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move,
      });
      this._stateUpdated(game.toModel());

      if (game.state.status !== 'OVER' && this._bot !== undefined) {
        const bestBotMove = this._getBotMove();
        // create and apply the move
        game.applyMove({
          gameID: command.gameID,
          playerID: this._bot?.id,
          move: {
            gamePiece: 'Red',
            col: bestBotMove,
          },
        });
      }

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new Connect4Game();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());

      // join a bot Player with a dummy town emitter
      this._bot = new Player('Bot', player.townEmitter);
      game.join(this._bot);
      this._stateUpdated(game.toModel());

      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());

      // leave the bot Player (if it exists)
      if (this._bot !== undefined) {
        game.leave(this._bot);
        this._bot = undefined;
        this._stateUpdated(game.toModel());
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  private _getBotMove(): Connect4GridPosition {
    const game = this._game;
    return 0;
  }
}
