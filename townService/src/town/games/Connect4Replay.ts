/* eslint-disable no-await-in-loop */
import Player from '../../lib/Player';
import { GameMove, Connect4GameState, Connect4Move } from '../../types/CoveyTownSocket';
import Game from './Game';

/*
This file shouln't be needed really but is needed to act as an interactable on the covey town map
/**
 * A Connect4Replay is a Game that implements the rules of Connect 4 using a previously played game.
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
   *  Shouldn't need to be called as all work is in frontend
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
