import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Connect4Board from './Connect4Board';
import Connect4AreaController, {
  Connect4Cell,
} from '../../../../classes/interactable/Connect4AreaController';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { Connect4GameState, GameArea, GameStatus } from '../../../../types/CoveyTownSocket';
import TownController from '../../../../classes/TownController';
import PlayerController from '../../../../classes/PlayerController';
import { act } from 'react-dom/test-utils';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

class MockConnect4AreaController extends Connect4AreaController {
  makeMove = jest.fn();

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

  public constructor() {
    super(nanoid(), mock<GameArea<Connect4GameState>>(), mock<TownController>());
  }

  /*
    For ease of testing, we will mock the board property
    to return a copy of the mockBoard property, so that
    we can change the mockBoard property and then check
    that the board property is updated correctly.
    */
  get board() {
    const copy = this.mockBoard.concat([]);
    for (let i = 0; i < 6; i++) {
      copy[i] = copy[i].concat([]);
    }
    return copy;
  }

  get isOurTurn() {
    return this.mockIsOurTurn;
  }

  get yellow(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get red(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get observers(): PlayerController[] {
    throw new Error('Method should not be called within this component.');
  }

  get moveCount(): number {
    throw new Error('Method should not be called within this component.');
  }

  get winner(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get whoseTurn(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get status(): GameStatus {
    throw new Error('Method should not be called within this component.');
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  get gamePiece(): 'Yellow' | 'Red' {
    throw new Error('Method should not be called within this component.');
  }

  public isActive(): boolean {
    throw new Error('Method should not be called within this component.');
  }

  public mockReset() {
    // this.mockBoard = [
    //   ['X', 'O', undefined],
    //   [undefined, 'X', undefined],
    //   [undefined, undefined, 'O'],
    // ];
    this.makeMove.mockReset();
  }
}
describe('Connect4Board', () => {
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

  const gameAreaController = new MockConnect4AreaController();
  beforeEach(() => {
    gameAreaController.mockReset();
    mockToast.mockReset();
  });
  async function checkBoard({
    clickable,
    checkMakeMove,
    checkToast,
  }: {
    clickable?: boolean;
    checkMakeMove?: boolean;
    checkToast?: boolean;
  }) {
    const cells = screen.getAllByRole('button');
    // 42 buttons for each square of connect 4 board
    expect(cells).toHaveLength(42);
    // Each cell should have the correct aria-label
    for (let i = 0; i < 42; i++) {
      expect(cells[i]).toHaveAttribute('aria-label', `Cell ${Math.floor(i / 7)},${i % 7}`);
    }
    // Each cell should have no texte content
    for (let i = 0; i < 42; i++) {
      const cell = gameAreaController.board[Math.floor(i / 7)][i % 7];
      expect(cells[i]).toHaveTextContent(cell ? cell : '');
    }
    if (clickable) {
      // Each cell should be clickable if it is the player's turn
      for (let i = 0; i < 42; i++) {
        expect(cells[i]).toBeEnabled();
        gameAreaController.makeMove.mockReset();
        mockToast.mockClear();

        fireEvent.click(cells[i]);
        if (checkMakeMove) {
          expect(gameAreaController.makeMove).toBeCalledWith(Math.floor(i / 7), i % 7);
          if (checkToast) {
            gameAreaController.makeMove.mockClear();
            expect(mockToast).not.toBeCalled();
            mockToast.mockClear();
            const expectedMessage = `Invalid Move ${nanoid()}}`;
            gameAreaController.makeMove.mockRejectedValue(new Error(expectedMessage));
            fireEvent.click(cells[i]);
            await waitFor(() => {
              expect(mockToast).toBeCalledWith(
                expect.objectContaining({
                  status: 'error',
                  description: `Error: ${expectedMessage}`,
                }),
              );
            });
          }
        }
      }
    } else {
      // Each cell should be disabled if it is not the player's turn
      for (let i = 0; i < 42; i++) {
        expect(cells[i]).toBeDisabled();
      }
    }
  }
  describe('When observing the game', () => {
    beforeEach(() => {
      gameAreaController.mockIsPlayer = false;
    });
    it('renders the board with the correct number of cells', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      const cells = screen.getAllByRole('button');
      // There should be exactly 9 buttons: one per-cell (and no other buttons in this component)
      expect(cells).toHaveLength(42);
      // Each cell should have the correct aria-label
      for (let i = 0; i < 42; i++) {
        expect(cells[i]).toHaveAttribute('aria-label', `Cell ${Math.floor(i / 7)},${i % 7}`);
      }
      // Each cell should have the correct text content
      expect(cells[0]).toHaveTextContent('');
      expect(cells[1]).toHaveTextContent('');
      expect(cells[2]).toHaveTextContent('');
      expect(cells[3]).toHaveTextContent('');
      expect(cells[4]).toHaveTextContent('');
      expect(cells[5]).toHaveTextContent('');
      expect(cells[6]).toHaveTextContent('');
      expect(cells[7]).toHaveTextContent('');
      expect(cells[8]).toHaveTextContent('');
      expect(cells[9]).toHaveTextContent('');
      expect(cells[10]).toHaveTextContent('');
      expect(cells[11]).toHaveTextContent('');
      expect(cells[12]).toHaveTextContent('');
      expect(cells[13]).toHaveTextContent('');
      expect(cells[14]).toHaveTextContent('');
      expect(cells[15]).toHaveTextContent('');
      expect(cells[16]).toHaveTextContent('');
      expect(cells[17]).toHaveTextContent('');
      expect(cells[18]).toHaveTextContent('');
      expect(cells[19]).toHaveTextContent('');
      expect(cells[20]).toHaveTextContent('');
      expect(cells[21]).toHaveTextContent('');
      expect(cells[22]).toHaveTextContent('');
      expect(cells[23]).toHaveTextContent('');
      expect(cells[24]).toHaveTextContent('');
      expect(cells[25]).toHaveTextContent('');
      expect(cells[26]).toHaveTextContent('');
      expect(cells[27]).toHaveTextContent('');
      expect(cells[28]).toHaveTextContent('');
      expect(cells[29]).toHaveTextContent('');
      expect(cells[30]).toHaveTextContent('');
      expect(cells[31]).toHaveTextContent('');
      expect(cells[32]).toHaveTextContent('');
      expect(cells[33]).toHaveTextContent('');
      expect(cells[34]).toHaveTextContent('');
      expect(cells[35]).toHaveTextContent('');
      expect(cells[36]).toHaveTextContent('');
      expect(cells[37]).toHaveTextContent('');
      expect(cells[38]).toHaveTextContent('');
      expect(cells[39]).toHaveTextContent('');
      expect(cells[40]).toHaveTextContent('');
      expect(cells[41]).toHaveTextContent('');
    });
    it('does not make a move when a cell is clicked, and cell is disabled', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      const cells = screen.getAllByRole('button');
      for (let i = 0; i < 42; i++) {
        expect(cells[i]).toBeDisabled();
        fireEvent.click(cells[i]);
        expect(gameAreaController.makeMove).not.toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalled();
      }
    });
    it('updates the board displayed in response to boardChanged events', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      gameAreaController.mockBoard = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, 'Red', undefined, undefined, undefined, undefined],
        ['Yellow', 'Red', 'Yellow', 'Red', 'Yellow', undefined, undefined],
      ];
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({});
      gameAreaController.mockBoard = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        ['Yellow', 'Red', 'Yellow', 'Red', 'Yellow', undefined, undefined],
      ];
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({});
    });
  });
  // START WRITING HERE
  describe('[T3.2] When playing the game', () => {
    beforeEach(() => {
      gameAreaController.mockIsPlayer = true;
      gameAreaController.mockIsOurTurn = true;
    });
    it("enables cells when it is the player's turn", async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockIsOurTurn = false;
      act(() => {
        gameAreaController.emit('turnChanged', gameAreaController.mockIsOurTurn);
      });
      await checkBoard({ clickable: false });
    });
    it('makes a move when a cell is clicked', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true });
    });
    it('displays an error toast when an invalid move is made', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true, checkToast: true });
    });
    it('updates the board in response to boardChanged events', async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockBoard = [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, 'Red', undefined, undefined, undefined, undefined],
        ['Yellow', 'Red', 'Yellow', 'Red', 'Yellow', undefined, undefined],
      ];
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({ clickable: true });
    });
    it("disables cells when it is not the player's turn", async () => {
      render(<Connect4Board gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockIsOurTurn = false;
      act(() => {
        gameAreaController.emit('turnChanged', gameAreaController.mockIsOurTurn);
      });
      await checkBoard({ clickable: false });
    });
  });
});
