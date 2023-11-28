import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  Connect4GameState,
  Connect4GridPosition,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type Connect4Cell = 'Yellow' | 'Red' | undefined;
export type Connect4Events = GameEventTypes & {
  boardChanged: (board: Connect4Cell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Connect 4 game, and for sending commands to the server
 */
export default class Connect4ReplayAreaController extends GameAreaController<
  Connect4GameState,
  Connect4Events
> {
  protected _board: Connect4Cell[][] = [
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  ];

  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of Connect4Cell, which is either 'Yellow', 'Red', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): Connect4Cell[][] {
    return this._board;
  }

  /**
   * Returns the player with the 'Yellow' game piece, if there is one, or undefined otherwise
   */
  get yellow(): PlayerController | undefined {
    const yellow = this._model.game?.state.yellow;
    if (yellow) {
      return this.occupants.find(eachOccupant => eachOccupant.id === yellow);
    }
    return undefined;
  }

  /**
   * Returns the player with the 'Red' game piece, if there is one, or undefined otherwise
   */
  get red(): PlayerController | undefined {
    const red = this._model.game?.state.red;
    if (red) {
      return this.occupants.find(eachOccupant => eachOccupant.id === red);
    }
    return undefined;
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    return this._model.game?.state.moves.length || 0;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    const yellow = this.yellow;
    const red = this.red;
    if (!yellow || !red || this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    if (this.moveCount % 2 === 0) {
      return yellow;
    } else if (this.moveCount % 2 === 1) {
      return red;
    } else {
      throw new Error('Invalid move count');
    }
  }

  get isOurTurn(): boolean {
    return this.whoseTurn?.id === this._townController.ourPlayer.id;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   */
  get gamePiece(): 'Yellow' | 'Red' {
    if (this.yellow?.id === this._townController.ourPlayer.id) {
      return 'Yellow';
    } else if (this.red?.id === this._townController.ourPlayer.id) {
      return 'Red';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this Connect4AreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<Connect4GameState>): void {
    const wasOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id;
    super._updateFrom(newModel);
    const newState = newModel.game;
    if (newState) {
      const newBoard: Connect4Cell[][] = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      ];
      // Added logic for moving pieces to the bottom of the boards availability for the column specified
      newState.state.moves.forEach(move => {
        for (let x = 5; x >= 0; x--) {
          if (newBoard[x][move.col] === undefined) {
            newBoard[x][move.col] = move.gamePiece;
            break;
          }
        }
      });

      if (!_.isEqual(newBoard, this._board)) {
        this._board = newBoard;
        this.emit('boardChanged', this._board);
      }
    }
    const isOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id;
    if (wasOurTurn != isOurTurn) this.emit('turnChanged', isOurTurn);
  }

  /**
   * Sends a request to the server to make a move in the game
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param col Column of the move
   */
  public async makeMove(col: Connect4GridPosition) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        col,
        gamePiece: this.gamePiece,
      },
    });
  }
}
