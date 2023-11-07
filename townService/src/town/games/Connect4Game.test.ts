import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
// import { Connect4Move } from '../../types/CoveyTownSocket';
import Connect4Game from './Connect4Game';
import { Connect4Move } from '../../types/CoveyTownSocket';

describe('Connect4Game', () => {
  let game: Connect4Game;

  beforeEach(() => {
    game = new Connect4Game();
  });

  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      // TODO weaker test suite doesn't add this
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('When the player can be added', () => {
      it('makes the first player Yellow and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.yellow).toEqual(player.id);
        expect(game.state.red).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
      describe('When the second player joins', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('makes the second player Red', () => {
          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual(player2.id);
        });
        it('sets the game status to IN_PROGRESS', () => {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.moves).toHaveLength(0);
        });
      });
    });
  });
  describe('[T1.2] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      // TODO weaker test suite only does one of these - above or below
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        test('when x leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual(player2.id);
        });
        test('when o leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual(player2.id);
        });
      });
      it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.yellow).toEqual(player1.id);
        expect(game.state.red).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
        game.leave(player1);
        expect(game.state.yellow).toBeUndefined();
        expect(game.state.red).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });
  describe('applyMove', () => {
    let moves: Connect4Move[] = [];

    describe('[T2.2] when given an invalid move', () => {
      it('should throw an error if the game is not in progress', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'Yellow', // passed in gamePiece is irrelevant b/c of implementation
              col: 1,
            },
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when the game is in progress', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
        it('should rely on the player ID to determine whose turn it is', () => {
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                col: 0,
                gamePiece: 'Red',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                col: 0,
                gamePiece: 'Yellow',
              },
            }),
          ).not.toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is out of turn for the player ID', () => {
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                col: 0,
                gamePiece: 'Red',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 0,
              gamePiece: 'Yellow',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                col: 1,
                gamePiece: 'Yellow',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          // TODO this is a tricky one - the weaker test suite doesn't check that the player 2's move is out of turn after their first move
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              col: 2,
              gamePiece: 'Red',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                col: 1,
                gamePiece: 'Red',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is on a full column', () => {
          // Need to write test where you completely fill up single column
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 0,
              gamePiece: 'Yellow',
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              col: 0,
              gamePiece: 'Red',
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 0,
              gamePiece: 'Yellow',
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              col: 0,
              gamePiece: 'Red',
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 0,
              gamePiece: 'Yellow',
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              col: 0,
              gamePiece: 'Red',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                col: 0,
                gamePiece: 'Yellow',
              },
            }),
          ).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
        });
        it('should not change whose turn it is when an invalid move is made', () => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 1,
              gamePiece: 'Yellow',
            },
          });
          expect(() => {
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                col: 1,
                gamePiece: 'Yellow',
              },
            });
          }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(game.state.moves).toHaveLength(1);
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              col: 2,
              gamePiece: 'Red',
            },
          });
          expect(game.state.moves).toHaveLength(2);
        });
      });
    });
    describe('when given a valid move', () => {
      let player1: Player;
      let player2: Player;
      let numMoves = 0;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        numMoves = 0;
        moves = [];
        game.join(player1);
        game.join(player2);
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      function makeMoveAndCheckState(
        col: 0 | 1 | 2 | 3 | 4 | 5 | 6,
        gamePiece: 'Yellow' | 'Red',
        expectedOutcome: 'WIN' | 'TIE' | undefined = undefined,
      ) {
        game.applyMove({
          gameID: game.id,
          playerID: gamePiece === 'Yellow' ? player1.id : player2.id,
          move: {
            col,
            gamePiece,
          },
        });
        moves.push({ col, gamePiece });
        expect(game.state.moves).toHaveLength(++numMoves);
        for (let i = 0; i < numMoves; i++) {
          expect(game.state.moves[i]).toEqual(moves[i]);
        }
        if (expectedOutcome === 'WIN') {
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(gamePiece === 'Yellow' ? player1.id : player2.id);
        } else if (expectedOutcome === 'TIE') {
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toBeUndefined();
        } else {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
        }
      }
      it('[T2.1] should add the move to the game state', () => {
        makeMoveAndCheckState(0, 'Yellow');
      });
      it('[T2.1] should not end the game if the move does not end the game', () => {
        makeMoveAndCheckState(0, 'Yellow');
        makeMoveAndCheckState(2, 'Red');
        makeMoveAndCheckState(1, 'Yellow');
      });
      describe('[T2.3] when the move ends the game', () => {
        describe('it checks for winning conditions', () => {
          describe('a vertical win', () => {
            test('yellow wins', () => {
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(0, 'Yellow', 'WIN');
            });
            test('red wins', () => {
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(1, 'Red', 'WIN');
            });
          });
          describe('a horizontal win', () => {
            test('yellow wins', () => {
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(6, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(6, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(6, 'Red');
              makeMoveAndCheckState(3, 'Yellow', 'WIN');
            });
            test('red wins', () => {
              makeMoveAndCheckState(5, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(6, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(6, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(6, 'Yellow');
              makeMoveAndCheckState(3, 'Red', 'WIN');
            });
          });
          describe('a diagonal win', () => {
            test('yellow wins', () => {
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(3, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(3, 'Red');
              makeMoveAndCheckState(3, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(3, 'Yellow', 'WIN');
            });
            test('red wins', () => {
              makeMoveAndCheckState(5, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(3, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(3, 'Yellow');
              makeMoveAndCheckState(3, 'Red');
              makeMoveAndCheckState(0, 'Yellow');
              makeMoveAndCheckState(3, 'Red', 'WIN');
            });
            test('other diagonal - yellow wins', () => {
              makeMoveAndCheckState(3, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(4, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(0, 'Yellow', 'WIN');
            });
            test('other diagonal - red wins', () => {
              makeMoveAndCheckState(6, 'Red');
              makeMoveAndCheckState(3, 'Yellow');
              makeMoveAndCheckState(2, 'Red');
              makeMoveAndCheckState(2, 'Yellow');
              makeMoveAndCheckState(1, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(1, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(4, 'Yellow');
              makeMoveAndCheckState(0, 'Red');
              makeMoveAndCheckState(0, 'Yellow', 'WIN');
            });
          });
        });
        it('declares a tie if there are no winning conditions but the board is full', () => {
          makeMoveAndCheckState(0, 'Yellow');
          makeMoveAndCheckState(0, 'Red');
          makeMoveAndCheckState(0, 'Yellow');
          makeMoveAndCheckState(0, 'Red');
          makeMoveAndCheckState(0, 'Yellow');
          makeMoveAndCheckState(0, 'Red');
          makeMoveAndCheckState(1, 'Yellow');
          makeMoveAndCheckState(1, 'Red');
          makeMoveAndCheckState(1, 'Yellow');
          makeMoveAndCheckState(1, 'Red');
          makeMoveAndCheckState(1, 'Yellow');
          makeMoveAndCheckState(1, 'Red');
          makeMoveAndCheckState(2, 'Yellow');
          makeMoveAndCheckState(2, 'Red');
          makeMoveAndCheckState(2, 'Yellow');
          makeMoveAndCheckState(2, 'Red');
          makeMoveAndCheckState(2, 'Yellow');
          makeMoveAndCheckState(2, 'Red');
          makeMoveAndCheckState(6, 'Yellow');
          makeMoveAndCheckState(3, 'Red');
          makeMoveAndCheckState(3, 'Yellow');
          makeMoveAndCheckState(3, 'Red');
          makeMoveAndCheckState(3, 'Yellow');
          makeMoveAndCheckState(3, 'Red');
          makeMoveAndCheckState(3, 'Yellow');
          makeMoveAndCheckState(4, 'Red');
          makeMoveAndCheckState(4, 'Yellow');
          makeMoveAndCheckState(4, 'Red');
          makeMoveAndCheckState(4, 'Yellow');
          makeMoveAndCheckState(4, 'Red');
          makeMoveAndCheckState(4, 'Yellow');
          makeMoveAndCheckState(5, 'Red');
          makeMoveAndCheckState(5, 'Yellow');
          makeMoveAndCheckState(5, 'Red');
          makeMoveAndCheckState(5, 'Yellow');
          makeMoveAndCheckState(5, 'Red');
          makeMoveAndCheckState(5, 'Yellow');
          makeMoveAndCheckState(6, 'Red');
          makeMoveAndCheckState(6, 'Yellow');
          makeMoveAndCheckState(6, 'Red');
          makeMoveAndCheckState(6, 'Yellow');
          makeMoveAndCheckState(6, 'Red', 'TIE');
        });
      });
    });
  });
});
