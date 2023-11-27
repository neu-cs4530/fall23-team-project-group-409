import { getMoveScores } from './Connect4BotSearch';

describe('Connect4BotSearch', () => {
  let board: string[][];

  beforeEach(() => {
    board = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
    ];
  });

  describe('getMoveScores', () => {
    it('should return a list of 7 scores when the bot can move anywhere', () => {
      expect(getMoveScores(board, 'Red')).toEqual({
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      });
    });
    it('should return a list of 1 score when the bot can only move in one spot', () => {
      board = [
        ['Red', 'Red', 'Red', 'Red', '', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
      ];
      expect(getMoveScores(board, 'Red')).toEqual({
        4: 10,
      });
    });
    it('should return a empty list when the player cant move anywhere', () => {
      board = [
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        ['Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
      ];
      expect(getMoveScores(board, 'Red')).toEqual({});
    });
  });

  describe('Minimax search', () => {
    it('Will choose to play in a winning column', () => {
      board = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['Red', '', '', '', '', '', ''],
        ['Red', '', '', '', '', '', ''],
        ['Red', '', '', '', '', '', ''],
      ];
      expect(getMoveScores(board, 'Red')).toEqual({
        0: 10,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      });
    });
    it('Will choose to block in a column it will lose', () => {
      board = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['Yellow', '', '', '', '', '', ''],
        ['Yellow', '', '', '', '', '', ''],
        ['Yellow', '', '', '', '', '', ''],
      ];
      expect(getMoveScores(board, 'Red')).toEqual({
        0: 0,
        1: -10,
        2: -10,
        3: -10,
        4: -10,
        5: -10,
        6: -10,
      });
    });
    it('Will choose to win before blocking a column it will lose', () => {
      board = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['Red', '', '', 'Yellow', '', '', ''],
        ['Red', '', '', 'Yellow', '', '', ''],
        ['Red', '', '', 'Yellow', '', '', ''],
      ];
      expect(getMoveScores(board, 'Red')).toEqual({
        0: 10,
        1: -10,
        2: -10,
        3: 0,
        4: -10,
        5: -10,
        6: -10,
      });
    });
  });
});
