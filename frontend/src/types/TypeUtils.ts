import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  Connect4GameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}

export function isConnect4Area(
  interactable: Interactable,
): interactable is GameArea<Connect4GameState> {
  return interactable.type === 'Connect4Area';
}

export function isConnect4ReplayArea(
  interactable: Interactable,
): interactable is GameArea<Connect4GameState> {
  return interactable.type === 'Connect4ReplayArea';
}

export function isConnect4BotArea(
  interactable: Interactable,
): interactable is GameArea<Connect4GameState> {
  return interactable.type === 'Connect4BotArea';
}
