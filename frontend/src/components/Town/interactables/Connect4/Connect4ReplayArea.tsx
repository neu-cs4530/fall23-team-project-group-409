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
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import Connect4Replay from './Connect4Replay';
import Connect4ReplayAreaController from '../../../../classes/interactable/Connect4ReplayAreaController';
import { getGames } from '../../../../../../townService/src/town/Database';

/**
 * The Connect4ReplayArea component renders the Connect4 replay area
 *
 * This should show all of the previously played games that are stored in the database, allowing
 * the user to click on a game and choose to replay whichever moves they played within the game.
 *
 * They can click next for the next move and back to the previous move.
 *
 * They can then exit and re-enter to watch another replay.
 *
 */
function Connect4ReplayArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<Connect4ReplayAreaController>(interactableID);
  const townController = useTownController();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gamesData, setGamesData] = useState<any[]>([]);
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
    const updateGameState = () => {};

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
                <Box
                  as='span'
                  flex='1'
                  textAlign='left'
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <h1>
                    <b>Game Replays</b>
                  </h1>
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              {gamesData &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                gamesData.map((game: any) => (
                  <Button
                    key={game.gameId}
                    onClick={() => handleGameClick(game.gameId)}
                    style={{ marginTop: '10px' }}>
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
        <Connect4Replay gameID={currentGameID} />
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
            <Image src='/assets/replay_icon.png' width='10%' marginLeft='3'></Image>
          </Center>
          <ModalCloseButton />
          <Connect4ReplayArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
