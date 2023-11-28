import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Container,
  Heading,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import Connect4Board from './Connect4Board';
import Connect4Replay from './Connect4Replay';
import Connect4ReplayAreaController from '../../../../classes/interactable/Connect4ReplayAreaController';
import { getGames, getYellowFromGame } from '../../../../../../townService/src/town/Database';

/**
 * The Connect4Area component renders the Connect4 game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the Connect4AreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A leaderboard (@see Leaderboard.tsx), which is passed the game history as a prop
 * - A list of observers' usernames (in a list with the aria-label 'list of observers in the game', one username per-listitem)
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for X and one for O)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `X: ${username}` and `O: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The Connect4Board component, which is passed the current gameAreaController as a prop (@see Connect4Board.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
function Connect4ReplayArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<Connect4ReplayAreaController>(interactableID);
  const townController = useTownController();

  const [gamesData, setGamesData] = useState<any[]>([]);
  const [y, setY] = useState<PlayerController | undefined>(gameAreaController.yellow);
  const [r, setR] = useState<PlayerController | undefined>(gameAreaController.red);
  const [currentGameID, setCurrentGameID] = useState<string>('');
  const [toggleReplayPlayer, setToggleReplayPlayer] = useState<boolean>(false);
  const toast = useToast();

  function handleGameClick(gameID: string) {
    setCurrentGameID(gameID);
    setToggleReplayPlayer(true);
  }

  useEffect(() => {
    setToggleReplayPlayer(false);
    const fetchGames = async () => {
      try {
        const games = await getGames();
        setGamesData(games);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    fetchGames();
  }, []);

  useEffect(() => {
    // Implement playing the game through recursive applying move
  }, [toggleReplayPlayer]);

  useEffect(() => {
    const updateGameState = () => {
      setY(gameAreaController.yellow);
      setR(gameAreaController.red);
    };

    gameAreaController.addListener('gameUpdated', updateGameState);

    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You ${winner === townController.ourPlayer ? 'won' : 'lost'}!`,
          status: 'error',
        });
      }
    };

    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  // Add game replays for all of the gameIds given
  /* When a game is clicked, toggle a value to true, and show the game,
   * once the button is clicked again, toggle back.
   */

  if (!toggleReplayPlayer) {
    return (
      <Container>
        <Accordion allowToggle>
          <AccordionItem>
            <Heading as='h3'>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  Game Replays
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              {gamesData &&
                gamesData.map((game: any) => (
                  <Button key={game.gameId} onClick={() => handleGameClick(game.gameId)}>
                    Start Game {game.yellowPlayer} vs. {game.redPlayer}
                  </Button>
                ))}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Container>
    );
  } else {
    return (
      <div>
        <Connect4Replay gameAreaController={gameAreaController} gameID={currentGameID} />
      </div>
    );
  }
}

/**
 * A wrapper component for the Connect4Area component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the Connect4Area component in a modal.
 *
 */
export default function Connect4ReplayAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'Connect4Replay') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <Center>
            <Image src='/assets/connect-four.png' width='50%'></Image>
          </Center>
          <ModalCloseButton />
          <Connect4ReplayArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}