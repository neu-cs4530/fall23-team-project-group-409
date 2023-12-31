import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, Connect4GameState, Connect4Move } from '../../types/CoveyTownSocket';
import Game from './Game';
import {
  addPlayer,
  editPlayerInfo,
  getAllPlayersFromTown,
  getPlayerInfo,
  writeGame,
} from '../Database';
import calculateEloRating from '../Elo';

/**
 * A Connect4Game is a Game that implements the rules of Connect 4.
 * @see https://en.wikipedia.org/wiki/connect-4
 */
export default class Connect4Game extends Game<Connect4GameState, Connect4Move> {
  public constructor(townID: string) {
    super(
      {
        moves: [],
        status: 'WAITING_TO_START',
      },
      townID,
    );
  }

  protected get _board() {
    const { moves } = this.state;
    const board = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
    ];
    // Checks each row from the bottom up for emptyness, and place the lowest (latest) undefined row with the move
    for (const move of moves) {
      for (let i = 5; i >= 0; i--) {
        if (board[i][move.col] === '') {
          board[i][move.col] = move.gamePiece;
          break;
        }
      }
    }
    return board;
  }

  /**
   * Checks the current game to see if it is over, and updates the state as necessary
   * @returns A promise for adding the game to the database.
   */
  protected async _checkForGameEnding() {
    const board = this._board;
    // A game ends when there are 4 in a row, column, or diagonal

    // lambda functions to check for each win condition
    const cH = (r: number, c: number) =>
      board[r][c] === board[r][c + 1] &&
      board[r][c] === board[r][c + 2] &&
      board[r][c] === board[r][c + 3];

    const cV = (r: number, c: number) =>
      board[r][c] === board[r + 1][c] &&
      board[r][c] === board[r + 2][c] &&
      board[r][c] === board[r + 3][c];

    const cDL = (r: number, c: number) =>
      board[r][c] === board[r + 1][c - 1] &&
      board[r][c] === board[r + 2][c - 2] &&
      board[r][c] === board[r + 3][c - 3];

    const cDR = (r: number, c: number) =>
      board[r][c] === board[r + 1][c + 1] &&
      board[r][c] === board[r + 2][c + 2] &&
      board[r][c] === board[r + 3][c + 3];

    // create a 'checking matrix' which defines functions to be applied to each spot of the board to check for winner
    // for example, spot (0,0) must be checked horizontally, vertically, and diagonally to the right
    const checkMat = [
      [
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR, cDL],
        [cV, cDL],
        [cV, cDL],
        [cV, cDL],
      ],
      [
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR, cDL],
        [cV, cDL],
        [cV, cDL],
        [cV, cDL],
      ],
      [
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR],
        [cH, cV, cDR, cDL],
        [cV, cDL],
        [cV, cDL],
        [cV, cDL],
      ],
      [[cH], [cH], [cH], [cH], [], [], []],
      [[cH], [cH], [cH], [cH], [], [], []],
      [[cH], [cH], [cH], [cH], [], [], []],
    ];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        // get the calculations for each column
        // if at least one is true, update the winner and return
        let isWinner = false;
        checkMat[i][j].forEach(fun => {
          isWinner = isWinner || (fun(i, j) && board[i][j] !== '');
        });
        if (isWinner) {
          this.state = {
            ...this.state,
            status: 'OVER',
            winner: board[i][j] === 'Red' ? this.state.red : this.state.yellow,
          };
          // ADD GAME TO DATABASE //
          this._updateDatabaseGame();
          return;
        }
      }
    }

    // Check for no more moves
    if (this.state.moves.length === 6 * 7) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: undefined,
      };
    }
  }

  /**
   * Handles errors for invalid moves in the Connect 4 game.
   * @param move Move to validate
   */
  protected _validateMove(move: Connect4Move) {
    // A move is valid if the space is empty
    let count = 0;
    for (const m of this.state.moves) {
      if (m.col === move.col) {
        count++;
        if (count === 6) {
          throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
        }
      }
    }

    // A move is only valid if it is the player's turn
    if (move.gamePiece === 'Yellow' && this.state.moves.length % 2 === 1) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    } else if (move.gamePiece === 'Red' && this.state.moves.length % 2 === 0) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    // A move is valid only if game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  /**
   * Apply the update to the state given a move to add.
   */
  protected _applyMove(move: Connect4Move): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
    this._checkForGameEnding();
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
    this._validateMove(cleanMove);
    this._applyMove(cleanMove);
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
   * Adds the given player into the database. If add fails, an exception will be thrown.
   * @param player Player to add to the database
   */
  protected async _addPlayerToDatabase(player: Player): Promise<void> {
    const allPlayersInTown = await getAllPlayersFromTown(this._townID);
    const allPlayersInTownList: string[] = allPlayersInTown.map(
      (user: { playerId: string }) => user.playerId,
    );
    if (!allPlayersInTownList.includes(player.id)) {
      await addPlayer({
        username: player.userName,
        elo: 1000,
        whatTown: this._townID,
        playerId: player.id,
        wins: 0,
        losses: 0,
        ties: 0,
      });
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
    // ADJUST ELO //
    const playerYellowInfo = await getPlayerInfo(this.state.yellow);
    const playerRedInfo = await getPlayerInfo(this.state.red);
    let result = '';
    let newRedWins = playerRedInfo.wins;
    let newRedLosses = playerRedInfo.losses;
    let newRedTies = playerRedInfo.ties;
    let newYellowWins = playerYellowInfo.wins;
    let newYellowLosses = playerYellowInfo.losses;
    let newYellowTies = playerYellowInfo.ties;
    if (this.state.winner === this.state.red) {
      result = 'win';
      newRedWins = playerRedInfo.wins + 1;
      newYellowLosses = playerYellowInfo.losses + 1;
    } else if (this.state.winner === this.state.yellow) {
      result = 'loss';
      newYellowWins = playerYellowInfo.wins + 1;
      newRedLosses = playerRedInfo.losses + 1;
    } else {
      result = 'draw';
      newYellowTies = playerYellowInfo.ties + 1;
      newRedTies = playerRedInfo.ties + 1;
    }
    const ratingChanges = calculateEloRating(playerRedInfo.elo, playerYellowInfo.elo, 10, result);
    await editPlayerInfo(
      this.state.red,
      ratingChanges.newRedRating,
      newRedWins,
      newRedLosses,
      newRedTies,
    );
    await editPlayerInfo(
      this.state.yellow,
      ratingChanges.newYellowRating,
      newYellowWins,
      newYellowLosses,
      newYellowTies,
    );
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
}
