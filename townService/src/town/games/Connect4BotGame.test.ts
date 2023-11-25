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
import Connect4BotGame from './Connect4BotGame';

describe('Connect4BotGame', () => {
  let game: Connect4BotGame;

  beforeEach(() => {
    game = new Connect4BotGame();
  });

  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);

      expect(() => game.join(player2)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('When the player can be added', () => {
      it('makes the first player Yellow and initializes the state with status IN_PROGRESS', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.yellow).toEqual(player.id);
        expect(game.state.red).toEqual('Bot');
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('IN_PROGRESS');
        expect(game.state.winner).toBeUndefined();
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
          game.join(player1);
          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual('Bot');

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual('Bot');
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.yellow).toEqual(player1.id);
          expect(game.state.red).toEqual('Bot');
        });
      });
    });
  });
  describe('applyMove', () => {
    describe('[T2.2] when given an invalid move', () => {
      it('should throw an error if the game is not in progress', () => {
        const player1 = createPlayerForTesting();
        // game.join(player1);
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
          while (game.state.moves.filter(move => move.col === 0).length !== 6) {
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                col: 0,
                gamePiece: 'Yellow',
              },
            });
          }
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
              playerID: player2.id,
              move: {
                col: 1,
                gamePiece: 'Red',
              },
            });
          }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(game.state.moves).toHaveLength(2);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              col: 2,
              gamePiece: 'Yellow',
            },
          });
          expect(game.state.moves).toHaveLength(4);
        });
      });
    });
  });
});
