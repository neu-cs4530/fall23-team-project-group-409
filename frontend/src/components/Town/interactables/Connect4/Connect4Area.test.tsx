import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import React from 'react';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import Connect4AreaController, {
  Connect4Cell,
} from '../../../../classes/interactable/Connect4AreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import {
  GameArea,
  GameResult,
  GameStatus,
  PlayerLocation,
  Connect4GameState,
  PlayerDatabase,
} from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import Connect4AreaWrapper from './Connect4Area';
import * as Connect4Board from '../Connect4/Connect4Board';
import * as Connect4Leaderboard from '../Connect4Leaderboard';

jest.mock('../Database', () => ({
  getAllPlayersInTown: jest.fn().mockResolvedValue([]),
}));

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('Connect4');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const leaderboardComponentSpy = jest.spyOn(Connect4Leaderboard, 'default');
leaderboardComponentSpy.mockReturnValue(<div data-testid='leaderboard' />);

const boardComponentSpy = jest.spyOn(Connect4Board, 'default');
boardComponentSpy.mockReturnValue(<div data-testid='board' />);

const randomLocation = (): PlayerLocation => ({
  moving: Math.random() < 0.5,
  rotation: 'front',
  x: Math.random() * 1000,
  y: Math.random() * 1000,
});

class MockConnect4AreaController extends Connect4AreaController {
  makeMove = jest.fn();

  joinGame = jest.fn();

  mockBoard: Connect4Cell[][] = [
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  ];

  mockIsPlayer = false;

  mockIsOurTurn = false;

  mockObservers: PlayerController[] = [];

  mockMoveCount = 0;

  mockWinner: PlayerController | undefined = undefined;

  mockWhoseTurn: PlayerController | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockYellow: PlayerController | undefined = undefined;

  mockRed: PlayerController | undefined = undefined;

  mockCurrentGame: GameArea<Connect4GameState> | undefined = undefined;

  mockGamePiece: 'Red' | 'Yellow' = 'Yellow';

  mockIsActive = false;

  mockHistory: GameResult[] = [];

  public constructor() {
    super(nanoid(), mock<GameArea<Connect4GameState>>(), mock<TownController>());
  }

  get board(): Connect4Cell[][] {
    throw new Error('Method should not be called within this component.');
  }

  get history(): GameResult[] {
    return this.mockHistory;
  }

  get isOurTurn() {
    return this.mockIsOurTurn;
  }

  get yellow(): PlayerController | undefined {
    return this.mockYellow;
  }

  get red(): PlayerController | undefined {
    return this.mockRed;
  }

  get observers(): PlayerController[] {
    return this.mockObservers;
  }

  get moveCount(): number {
    return this.mockMoveCount;
  }

  get winner(): PlayerController | undefined {
    return this.mockWinner;
  }

  get whoseTurn(): PlayerController | undefined {
    return this.mockWhoseTurn;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  get gamePiece(): 'Red' | 'Yellow' {
    return this.mockGamePiece;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockReset() {
    this.mockBoard = [
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, 'Red', undefined, undefined, undefined, undefined],
      ['Yellow', 'Red', 'Yellow', 'Red', 'Yellow', undefined, undefined],
    ];
    this.makeMove.mockReset();
  }
}
describe('[T2] Connect4Area', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let gameAreaController = new MockConnect4AreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;

  function renderConnect4Area() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <Connect4AreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
  beforeEach(() => {
    ourPlayer = new PlayerController('player yellow', 'player yellow', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    gameAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    leaderboardComponentSpy.mockClear();
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
  });
  describe('[T2.1] Game update listeners', () => {
    it('Registers exactly two listeners when mounted: one for gameUpdated and one for gameEnd', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderConnect4Area();
      expect(addListenerSpy).toBeCalledTimes(2);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnect4Area();
      expect(addListenerSpy).toBeCalledTimes(2);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <Connect4AreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnect4Area();
      expect(addListenerSpy).toBeCalledTimes(2);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
      expect(addedGameEndedListener).toBeDefined();
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(2);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
      expect(removedGameEndedListener).toEqual(addedGameEndedListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnect4Area();
      expect(addListenerSpy).toBeCalledTimes(2);

      gameAreaController = new MockConnect4AreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <Connect4AreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(2);

      expect(addListenerSpy2).toBeCalledTimes(2);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T2.2] Rendering the leaderboard', () => {
    it('Renders the leaderboard with the history when the component is mounted', () => {
      const mockPlayers: PlayerDatabase[] = [];
      renderConnect4Area();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: mockPlayers,
        },
        {},
      );
    });
    // it('Renders the leaderboard with the history when the game is updated', () => {
    //   const mockPlayers: PlayerDatabase[] = [];
    //   renderConnect4Area();
    //   expect(leaderboardComponentSpy).toHaveBeenCalledWith(
    //     {
    //       results: mockPlayers,
    //     },
    //     {},
    //   );

    //   const mockPlayers2: PlayerDatabase[] = [
    //     {
    //       username: nanoid(),
    //       whatTown: nanoid(),
    //       playerId: nanoid(),
    //       elo: 1000,
    //       wins: 0,
    //       losses: 0,
    //       ties: 0,
    //     },
    //   ];
    //   act(() => {
    //     gameAreaController.emit('gameUpdated');
    //   });
    //   expect(leaderboardComponentSpy).toHaveBeenCalledWith(
    //     {
    //       results: mockPlayers2,
    //     },
    //     {},
    //   );
    // });
  });
  describe('[T2.3] Join game button', () => {
    it('Is not shown when the player is in a not-yet-started game', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockYellow = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderConnect4Area();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockYellow = new PlayerController(
        'player X',
        'player X',
        randomLocation(),
      );
      gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
      gameAreaController.mockIsPlayer = false;
      renderConnect4Area();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is enabled when the player is not in a game and the game is not in progress', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockYellow = undefined;
      gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
      gameAreaController.mockIsPlayer = false;
      renderConnect4Area();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    describe('When clicked', () => {
      it('Calls joinGame on the gameAreaController', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderConnect4Area();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
      });
      it('Displays a toast with the error message if there is an error joining the game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        const errorMessage = nanoid();
        renderConnect4Area();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        act(() => {
          joinGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });

      it('Is disabled and set to loading when the player is joining a game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderConnect4Area();
        const button = screen.getByText('Join New Game');
        expect(button).toBeEnabled();
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
        act(() => {
          joinGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
      });
    });
    it('Adds the display of the button when a game becomes possible to join', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = new PlayerController(
        'player X',
        'player X',
        randomLocation(),
      );
      gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
      renderConnect4Area();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    it('Removes the display of the button when a game becomes no longer possible to join', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = undefined;
      gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
      renderConnect4Area();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockYellow = new PlayerController(
          'player X',
          'player X',
          randomLocation(),
        );
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
  });
  describe('[T2.4] Rendering the current observers', () => {
    beforeEach(() => {
      gameAreaController.mockObservers = [
        new PlayerController('player 1', 'player 1', randomLocation()),
        new PlayerController('player 2', 'player 2', randomLocation()),
        new PlayerController('player 3', 'player 3', randomLocation()),
      ];
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = new PlayerController(
        'player X',
        'player X',
        randomLocation(),
      );
      gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
    });
    it('Displays the correct observers when the component is mounted', () => {
      renderConnect4Area();
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
    it('Displays the correct observers when the game is updated', () => {
      renderConnect4Area();
      act(() => {
        gameAreaController.mockObservers = [
          new PlayerController('player 1', 'player 1', randomLocation()),
          new PlayerController('player 2', 'player 2', randomLocation()),
          new PlayerController('player 3', 'player 3', randomLocation()),
          new PlayerController('player 4', 'player 4', randomLocation()),
        ];
        gameAreaController.emit('gameUpdated');
      });
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
  });
  describe('Players in the game text', () => {
    it('Displays the username of the X player if the X player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Yellow: ${gameAreaController.mockYellow?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays the username of the O player if the O player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockRed = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Red: ${gameAreaController.mockRed?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays "X: (No player yet!)" if the X player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = undefined;
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Yellow: (No player yet!)`)).toBeInTheDocument();
    });
    it('Displays "O: (No player yet!)" if the O player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockRed = undefined;
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Red: (No player yet!)`)).toBeInTheDocument();
    });
    it('Updates the X player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Yellow: (No player yet!)`)).toBeInTheDocument();
      act(() => {
        gameAreaController.mockYellow = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Yellow: ${gameAreaController.mockYellow?.userName}`),
      ).toBeInTheDocument();
    });
    it('Updates the O player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderConnect4Area();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Red: (No player yet!)`)).toBeInTheDocument();
      act(() => {
        gameAreaController.mockRed = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Red: ${gameAreaController.mockRed?.userName}`),
      ).toBeInTheDocument();
    });
  });
  describe('[T2.6] Game status text', () => {
    it('Displays the correct text when the game is waiting to start', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderConnect4Area();
      expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      renderConnect4Area();
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderConnect4Area();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    describe('When a game is in progress', () => {
      beforeEach(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockMoveCount = 2;
        gameAreaController.mockYellow = ourPlayer;
        gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
        gameAreaController.mockWhoseTurn = gameAreaController.mockYellow;
        gameAreaController.mockIsOurTurn = true;
      });

      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is our turn', () => {
        renderConnect4Area();
        expect(
          screen.getByText(`Game in progress, 2 moves in, currently your turn`, { exact: false }),
        ).toBeInTheDocument();
      });

      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is the other player\'s turn', () => {
        gameAreaController.mockMoveCount = 1;
        gameAreaController.mockWhoseTurn = gameAreaController.mockRed;
        gameAreaController.mockIsOurTurn = false;
        renderConnect4Area();
        expect(
          screen.getByText(
            `Game in progress, 1 moves in, currently ${gameAreaController.red?.userName}'s turn`,
            { exact: false },
          ),
        ).toBeInTheDocument();
      });

      it('Updates the move count when the game is updated', () => {
        renderConnect4Area();
        expect(
          screen.getByText(`Game in progress, 2 moves in`, { exact: false }),
        ).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.mockRed;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`Game in progress, 3 moves in`, { exact: false }),
        ).toBeInTheDocument();
      });
      it('Updates the whose turn it is when the game is updated', () => {
        renderConnect4Area();
        expect(screen.getByText(`, currently your turn`, { exact: false })).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.mockRed;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`, currently ${gameAreaController.mockRed?.userName}'s turn`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
    });
    it('Updates the game status text when the game is updated', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderConnect4Area();
      expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    describe('When the game ends', () => {
      it('Displays a toast with the winner', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockYellow = ourPlayer;
        gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
        gameAreaController.mockWinner = ourPlayer;
        renderConnect4Area();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You won!`,
          }),
        );
      });
      it('Displays a toast with the loser', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockYellow = ourPlayer;
        gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
        gameAreaController.mockWinner = gameAreaController.mockRed;
        renderConnect4Area();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You lost :(`,
          }),
        );
      });
      it('Displays a toast with a tie', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockYellow = ourPlayer;
        gameAreaController.mockRed = new PlayerController('player O', 'player O', randomLocation());
        gameAreaController.mockWinner = undefined;
        renderConnect4Area();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `Game ended in a tie`,
          }),
        );
      });
    });
  });
});
