import { IconButton, chakra, Container, useToast, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Connect4AreaController, {
  Connect4Cell,
} from '../../../../classes/interactable/Connect4AreaController';
import { Connect4GridPosition, Connect4Move } from '../../../../types/CoveyTownSocket';
import { getMoves } from '../../../../../../townService/src/town/Database';
import { yellow } from '@material-ui/core/colors';
import Connect4ReplayAreaController from '../../../../classes/interactable/Connect4ReplayAreaController';

export type Connect4Props = {
  gameAreaController: Connect4ReplayAreaController;
};

/**
 * A component that will render a single cell in the Connect4 board, styled
 */
const StyledConnect4Square = chakra(IconButton, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '14.2857%',
    border: '1px solid blue',
    height: '16.6667%',
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
    backgroundColor: '#2986CC',
  },
});

function timeout(delay: number) {
  return new Promise(res => setTimeout(res, delay));
}

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
export default function Connect4Replay(props: {
  gameAreaController: Connect4ReplayAreaController;
  gameID: string;
}): JSX.Element {
  const [board, setBoard] = useState<Connect4Cell[][]>(props.gameAreaController.board);
  const [isYellowTurn, setIsYellowTurn] = useState<boolean>(true);
  const toast = useToast();
  //const [yellowPlayer, setYellowPlayer] = useState<PlayerController | undefined>(];
  const [movesYellow, setMovesYellow] = useState<Connect4GridPosition[]>([]);
  const [movesRed, setMovesRed] = useState<Connect4GridPosition[]>([]);
  const [currentMoves, setCurrentMoves] = useState<Connect4Move[]>([]);

  function changeBoard(newMoves: Connect4Move[]) {
    const newBoard: Connect4Cell[][] = [
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    ];
    // Added logic for moving pieces to the bottom of the boards availability for the column specified
    newMoves.forEach(move => {
      for (let x = 5; x >= 0; x--) {
        if (newBoard[x][move.col] === undefined) {
          newBoard[x][move.col] = move.gamePiece;
          break;
        }
      }
    });
    setBoard(newBoard);
  }

  function handleBackTurnClick() {
    if (currentMoves.length >= 0) {
      const movesTemp = currentMoves;
      movesTemp.pop();
      setCurrentMoves(movesTemp);
      changeBoard(currentMoves);
    }
    console.log(currentMoves);
  }

  function handleForwardTurnClick() {
    console.log('hi');
    if (currentMoves.length < movesYellow.length + movesRed.length) {
      if (currentMoves.length % 2 === 0) {
        currentMoves.push({
          col: movesYellow[currentMoves.length / 2],
          gamePiece: 'Yellow',
        });
        setCurrentMoves([...currentMoves]);
        changeBoard(currentMoves);
      } else {
        const redIndex = Math.floor(currentMoves.length / 2);
        currentMoves.push({
          col: movesRed[redIndex],
          gamePiece: 'Red',
        });
        setCurrentMoves([...currentMoves]);
        changeBoard(currentMoves);
      }
    }
    console.log(currentMoves);
  }

  useEffect(() => {
    const fetchMoves = async () => {
      try {
        const { yellowMoves, redMoves } = await getMoves(props.gameID);

        console.log(props.gameID);

        setMovesYellow(yellowMoves);
        setMovesRed(redMoves);

        console.log(yellowMoves);
        console.log(redMoves);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    fetchMoves();
  }, []);

  useEffect(() => {
    props.gameAreaController.addListener('turnChanged', setIsYellowTurn);
    props.gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      props.gameAreaController.removeListener('boardChanged', setBoard);
      props.gameAreaController.removeListener('turnChanged', setIsYellowTurn);
    };
  }, [props.gameAreaController]);

  useEffect(() => {
    console.log(currentMoves);
  }, [board, currentMoves]);

  return (
    <StyledConnect4Board aria-label='Connect-4 Board' colorScheme='blue'>
      <h1>{}</h1>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          return (
            <StyledConnect4Square
              key={`${rowIndex}.${colIndex}`}
              isRound={true}
              disabled={true}
              aria-label={`Cell ${rowIndex},${colIndex}`}
              colorScheme={cell?.toLowerCase()}>
              {}
            </StyledConnect4Square>
          );
        });
      })}
      <Button onClick={() => handleBackTurnClick()}>Back</Button>
      <Button onClick={() => handleForwardTurnClick()}>Forward</Button>
    </StyledConnect4Board>
  );
}
