import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import TicTacToeGameArea from './TicTacToeGameArea';
import Connect4GameArea from './Connect4GameArea';
import Connect4ReplayArea from './Connect4ReplayArea';
import Connect4BotGameArea from './Connect4BotGameArea';

/**
 * Creates a new GameArea from a map object
 * @param mapObject the map object to create the game area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function GameAreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
  townID: string,
): InteractableArea {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const gameType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (gameType === 'TicTacToe') {
    return new TicTacToeGameArea(name, rect, broadcastEmitter, townID);
  }
  if (gameType === 'Connect4') {
    return new Connect4GameArea(name, rect, broadcastEmitter, townID);
  }
  if (gameType === 'Connect4Replay') {
    return new Connect4ReplayArea(name, rect, broadcastEmitter, townID);
  }
  if (gameType === 'Connect4Bot') {
    return new Connect4BotGameArea(name, rect, broadcastEmitter, townID);
  }
  throw new Error(`Unknown game area type ${mapObject.class}`);
}
