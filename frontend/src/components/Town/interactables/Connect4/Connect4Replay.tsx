import { IconButton, chakra, Container, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Connect4Cell } from '../../../../classes/interactable/Connect4AreaController';
import { Connect4GridPosition, Connect4Move } from '../../../../types/CoveyTownSocket';
import {
  getMoves,
  getYellowFromGame,
  getRedFromGame,
} from '../../../../../../townService/src/town/Database';
import { getPlayerInfo } from '../../../../../../townService/src/town/Database';

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
 * Clicking on the move forward button with the right button will move the game forward by one move.
 * Clicking on the move back button with the left button will move the game back by one move.
 *
 * @param gameID the ID for the Connect4 game
 */
export default function Connect4Replay(props: { gameID: string }): JSX.Element {
  // Sets the initial states for required users and moves (and board)
  const [board, setBoard] = useState<Connect4Cell[][]>([
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  ]);
  const [yellowPlayerName, setYellowPlayerName] = useState<string>('');
  const [redPlayerName, setRedPlayerName] = useState<string>('');

  const [movesYellow, setMovesYellow] = useState<Connect4GridPosition[]>([]);
  const [movesRed, setMovesRed] = useState<Connect4GridPosition[]>([]);
  const [currentMoves, setCurrentMoves] = useState<Connect4Move[]>([]);

  function changeBoard(newMoves: Connect4Move[]) {
    // Completely recreate the board based on the changed moves array and re-render on change
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

  // Handles the back button click
  // Removes the last move from the currentMoves array and re-renders the board
  function handleBackTurnClick() {
    if (currentMoves.length >= 0) {
      const movesTemp = currentMoves;
      movesTemp.pop();
      setCurrentMoves(movesTemp);
      changeBoard(currentMoves);
    }
  }

  // Handles the forward button click
  // Adds the next move from the movesYellow and movesRed arrays to the currentMoves array and re-renders the board
  function handleForwardTurnClick() {
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
  }

  useEffect(() => {
    const fetchMovesAndNames = async () => {
      try {
        const { yellowMoves, redMoves } = await getMoves(props.gameID);
        setMovesYellow(yellowMoves);
        setMovesRed(redMoves);

        const redPlayerID = await getRedFromGame(props.gameID);
        const yellowPlayerID = await getYellowFromGame(props.gameID);
        const yellowUser = await getPlayerInfo(yellowPlayerID);
        let redUserName = 'Bot';
        if (redPlayerID !== 'Bot') {
          const redUser = await getPlayerInfo(redPlayerID);
          redUserName = redUser.username;
        }
        setYellowPlayerName(yellowUser.username);
        setRedPlayerName(redUserName);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    fetchMovesAndNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Re-render whenever the board or currentMoves array changes (back button or next button is clicked)
  }, [board, currentMoves]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>
          <b style={{ fontSize: '12px', color: 'red' }}>
            {yellowPlayerName + ' (Yellow)'} vs. {redPlayerName + ' (Red)'}
          </b>
        </h1>
      </div>
      <StyledConnect4Board aria-label='Connect-4 Board' colorScheme='blue'>
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
      </StyledConnect4Board>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
        <Button
          style={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ccc' }}
          onClick={() => handleBackTurnClick()}>
          Back
        </Button>
        <Button
          style={{
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ccc',
          }}
          onClick={() => handleForwardTurnClick()}>
          Next
        </Button>
      </div>
    </div>
  );
}
