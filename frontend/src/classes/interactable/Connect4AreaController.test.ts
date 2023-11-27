import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  Connect4GameState,
  Connect4GridPosition,
  Connect4Move,
  GameArea,
  GameResult,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
import Connect4AreaController, { NO_GAME_IN_PROGRESS_ERROR } from './Connect4AreaController';
//import TicTacToeAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './TicTacToeAreaController';

describe('[T1] Connect4AreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  /*function ticTacToeAreaControllerWithProp({
    _id,
    history,
    x,
    o,
    undefinedGame,
    status,
    moves,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    x?: string;
    o?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: TicTacToeMove[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (x) players.push(x);
    if (o) players.push(o);
    const ret = new TicTacToeAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'TicTacToeArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                x: x,
                o: o,
                moves: moves || [],
                winner: winner,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }*/
  function connect4AreaControllerWithProp({
    _id,
    history,
    yellow,
    red,
    undefinedGame,
    status,
    moves,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    yellow?: string;
    red?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: Connect4Move[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (yellow) players.push(yellow);
    if (red) players.push(red);
    const ret = new Connect4AreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        gameReplays: [],
        type: 'Connect4Area',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                yellow: yellow,
                red: red,
                moves: moves || [],
                winner: winner,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }

  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
          red: otherPlayers[1].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('should return the game piece of the current player if the current player is a player in this game', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
        });
        expect(controller.gamePiece).toBe('Yellow');

        //check Red
        const controller2 = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          red: ourPlayer.id,
        });
        expect(controller2.gamePiece).toBe('Red');
      });
      it('should throw an error if the current player is not a player in this game', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
          red: otherPlayers[1].id,
        });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = connect4AreaControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('whoseTurn', () => {
      it('should return the player whose turn it is initially', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(ourPlayer);
      });
      it('should return the player whose turn it is after a move', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
          moves: [
            {
              gamePiece: 'Yellow',
              col: 0,
            },
          ],
        });
        expect(controller.whoseTurn).toBe(otherPlayers[0]);
      });
      it('should return undefined if the game is not in progress', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'OVER',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(undefined);
      });
    });
    describe('isOurTurn', () => {
      it('should return true if it is our turn', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('should return false if it is not our turn', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
          red: ourPlayer.id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('moveCount', () => {
      it('should return the number of moves that have been made', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
          moves: [
            {
              gamePiece: 'Yellow',
              col: 0,
            },
          ],
        });
        expect(controller.moveCount).toBe(1);
      });
    });
    describe('board', () => {
      it('should return an empty board by default', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        expect(controller.board).toEqual([
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        ]);
      });
    });
    describe('yellow', () => {
      it('should return the yellow player if there is one', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        expect(controller.yellow).toBe(ourPlayer);
      });
      it('should return undefined if there is no yellow player and the game is waiting to start', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.yellow).toBe(undefined);
      });
      it('should return undefined if there is no yellow player', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          red: otherPlayers[0].id,
        });
        expect(controller.yellow).toBe(undefined);
      });
    });
    describe('red', () => {
      it('should return the red player if there is one', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
          red: ourPlayer.id,
        });
        expect(controller.red).toBe(ourPlayer);
      });
      it('should return undefined if there is no red player and the game is waiting to start', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.red).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
        });
        expect(controller.red).toBe(undefined);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'OVER',
          yellow: otherPlayers[0].id,
          red: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = connect4AreaControllerWithProp({
          status: 'OVER',
          yellow: otherPlayers[0].id,
          red: ourPlayer.id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = connect4AreaControllerWithProp({});
        await expect(async () => controller.makeMove(0)).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
        // Simulate joining the game for real
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove(1);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: {
            col: 1,
            gamePiece: 'Yellow',
          },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: Connect4AreaController;
      beforeEach(() => {
        controller = connect4AreaControllerWithProp({
          status: 'IN_PROGRESS',
          yellow: ourPlayer.id,
          red: otherPlayers[0].id,
        });
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
          {
            gamePiece: 'Red',
            col: 1 as Connect4GridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const boardChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(boardChangedCall).toBeDefined();
        if (boardChangedCall)
          expect(boardChangedCall[1]).toEqual([
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            ['Yellow', 'Red', undefined, undefined, undefined, undefined, undefined],
          ]);
      });
      it('should emit a turnChanged event with true if it is our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
          {
            gamePiece: 'Red',
            col: 1 as Connect4GridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: [newMoves[0]],
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const testModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(testModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(true);
      });
      it('should emit a turnChanged event with false if it is not our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
        ];
        expect(controller.isOurTurn).toBe(true);
        assert(model.game);
        const newModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(false);
      });
      it('should not emit a turnChanged event if the turn has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        expect(controller.isOurTurn).toBe(true);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);

        const newMoves: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
          {
            gamePiece: 'Red',
            col: 1 as Connect4GridPosition,
          },
        ];
        const newModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));

        const newMovesWithShuffle: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
          {
            gamePiece: 'Red',
            col: 1 as Connect4GridPosition,
          },
        ];

        const newModelWithSuffle: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMovesWithShuffle,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModelWithSuffle, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should update the board returned by the board property', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<Connect4Move> = [
          {
            gamePiece: 'Yellow',
            col: 0 as Connect4GridPosition,
          },
          {
            gamePiece: 'Red',
            col: 1 as Connect4GridPosition,
          },
        ];
        assert(model.game);
        const newModel: GameArea<Connect4GameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              moves: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(controller.board).toEqual([
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
          ['Yellow', 'Red', undefined, undefined, undefined, undefined, undefined],
        ]);
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = connect4AreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
