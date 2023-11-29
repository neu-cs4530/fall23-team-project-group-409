import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import Connect4Replay from './Connect4Replay';
import GameArea from './GameArea';

/**
 * A Connect4ReplayArea is a GameArea that hosts a Connect4Replay.
 * @see Connect4Game
 * @see GameArea
 */
export default class Connect4ReplayArea extends GameArea<Connect4Replay> {
  protected getType(): InteractableType {
    return 'Connect4ReplayArea';
  }

  /**
   * Needs to exist for the GameArea interactable
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    return undefined as InteractableCommandReturnType<CommandType>;
  }
}
