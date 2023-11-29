import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, Connect4Move, Connect4GridPosition } from '../../types/CoveyTownSocket';
import { writeGame } from '../Database';
import { getMoveScores, ScoreList } from './Connect4BotSearch';
import Connect4Game from './Connect4Game';

/**
 * A Connect4BotGame is a Game that implements the rules of Connect 4, with a bot.
 * @see https://en.wikipedia.org/wiki/connect-4
 */
export default class Connect4BotGame extends Connect4Game {
  private _depth: number;

  public constructor(townID: string, depth: number) {
    super(townID);
    this._depth = depth;
  }

  /**
   * Returns the best move for the bot in the current board state.
   * It does so by delegating to the Connect4BotGame, which calls search functions
   * to get the best move out of all possible moves.
   */
  private _getBestBotMove(): Connect4GridPosition {
    const board = this._board;

    const scores: ScoreList = getMoveScores(board, 'Red', this._depth);
    const values = Object.keys(scores).map(k => scores[Number(k)]);
    const keys = Object.keys(scores);
    keys.sort((a, b) => values[keys.indexOf(b)] - values[keys.indexOf(a)]);

    // randomly choose between the highest scores
    const highScores = [Number(keys[0])];
    for (let i = 1; i < keys.length && values[Number(keys[i])] === values[Number(keys[0])]; i++) {
      highScores.push(Number(keys[i]));
    }
    const col: number = highScores[Math.floor(Math.random() * highScores.length)];
    const numberToGridPos = (n: number | Connect4GridPosition): n is Connect4GridPosition =>
      n >= 0 && n <= 6;
    if (numberToGridPos(col)) {
      return col;
    }
    return 0;
  }

  /*
   * Applies a player's move to the game.
   * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
   * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
   * the error message specified below.
   * A move is invalid if:
   *    - The move is out of bounds (not in the 3x3 grid - use MOVE_OUT_OF_BOUNDS_MESSAGE)
   *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
   *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *
   * If the move is valid, applies the move to the game and updates the game state.
   *
   * If the move ends the game, updates the game's state.
   * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
   * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
   * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid
   */
  public applyMove(move: GameMove<Connect4Move>): void {
    // DONE
    if (this.state.status !== 'IN_PROGRESS') {
      throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    let gamePiece: 'Yellow' | 'Red';
    if (move.playerID === this.state.yellow) {
      gamePiece = 'Yellow';
    } else {
      gamePiece = 'Red';
    }
    const cleanMove = {
      gamePiece,
      col: move.move.col,
    };
    this._validateMove(cleanMove);
    this._applyMove(cleanMove);

    if (this.state.status === 'IN_PROGRESS') {
      const moveCol = this._getBestBotMove();
      gamePiece = 'Red';
      const myMove = {
        gamePiece,
        col: moveCol,
      };
      this._validateMove(myMove);
      this._applyMove(myMove);
    }
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * When there are no players, the first player to join is yellow
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this.state.yellow === player.id || this.state.red === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.yellow) {
      this.state = {
        ...this.state,
        yellow: player.id,
        red: 'Bot',
      };
    } else if (!this.state.red) {
      this.state = {
        ...this.state,
        red: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.yellow && this.state.red) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
    // If the player is not in the database, add player
    this._addPlayerToDatabase(player);
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.yellow !== player.id && this.state.red !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // Handles case where the game has not started yet
    if (this.state.red === undefined) {
      this.state = {
        moves: [],
        status: 'WAITING_TO_START',
      };
      return;
    }
    if (this.state.yellow === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.red,
      };
    } else {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.yellow,
      };
    }
  }

  /**
   * Adds the current game into the database. If add fails, an exception will be thrown.
   */
  protected async _updateDatabaseGame(): Promise<void> {
    const redMoves: number[] = this.state.moves
      .filter(move => move.gamePiece === 'Red')
      .map(move => move.col);
    const yellowMoves: number[] = this.state.moves
      .filter(move => move.gamePiece === 'Yellow')
      .map(move => move.col);

    await writeGame({
      gameId: this.id,
      townId: this._townID,
      redPlayer: this.state.red,
      yellowPlayer: this.state.yellow,
      winner: this.state.winner,
      redMoves,
      yellowMoves,
    });
  }
}
