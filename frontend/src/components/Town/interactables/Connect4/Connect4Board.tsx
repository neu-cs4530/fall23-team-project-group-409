import { IconButton, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Connect4AreaController, {
  Connect4Cell,
} from '../../../../classes/interactable/Connect4AreaController';
import { Connect4GridPosition } from '../../../../types/CoveyTownSocket';

export type Connect4GameProps = {
  gameAreaController: Connect4AreaController;
};

/**
 * A component that will render a single cell in the Connect4 board, styled
 */
const StyledConnect4Square = chakra(IconButton, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '14%',
    border: '4px solid black',
    height: '17%',
    fontSize: '25px',
    _disabled: {
      opacity: '100%',
    },
  },
});
/**
 * A component that will render the Connect4 board, styled
 */
const StyledConnect4Board = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '345px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the Connect4 board
 *
 * Renders the Connect4 board as a "StyledConnect4Board", which consists of 9 "StyledConnect4Square"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 * Each StyledConnect4Square has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex}`.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the game, then each StyledConnect4Square is clickable, and clicking
 * on it will make a move in that cell. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledConnect4Square will be disabled.
 *
 * @param gameAreaController the controller for the Connect4 game
 */
export default function Connect4Board({ gameAreaController }: Connect4GameProps): JSX.Element {
  const [board, setBoard] = useState<Connect4Cell[][]>(gameAreaController.board);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const toast = useToast();
  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController]);
  return (
    <StyledConnect4Board aria-label='Connect-4 Board'>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          return (
            <StyledConnect4Square
              key={`${rowIndex}.${colIndex}`}
              isRound={true}
              onClick={async () => {
                try {
                  await gameAreaController.makeMove(colIndex as Connect4GridPosition);
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${rowIndex},${colIndex}`}
              colorScheme={cell?.toLowerCase()}>
              {}
            </StyledConnect4Square>
          );
        });
      })}
    </StyledConnect4Board>
  );
}
