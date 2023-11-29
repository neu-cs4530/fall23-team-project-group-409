/* eslint-disable no-await-in-loop */
import Player from '../../lib/Player';
import { GameMove, Connect4GameState, Connect4Move } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A Connect4Game is a Game that implements the rules of Connect 4.
 * @see https://en.wikipedia.org/wiki/connect-4
 */
export default class Connect4Replay extends Game<Connect4GameState, Connect4Move> {
  public constructor(townID: string) {
    super(
      {
        moves: [],
        status: 'WAITING_TO_START',
      },
      townID,
    );
  }

  // DONE
  private get _board() {
    const board = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
    ];
    return board;
  }

  private _applyMove(move: Connect4Move): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
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
    this._applyMove(cleanMove);
  }

  /**
   * Shouldn't be called
   */
  protected _join(player: Player): void {
    // Not necessary but must exist for Connect4ReplayArea
  }

  /**
   * Shouldn't be called
   */
  protected _leave(player: Player): void {
    // Not necessary but must exist for Connect4ReplayArea
  }
}
