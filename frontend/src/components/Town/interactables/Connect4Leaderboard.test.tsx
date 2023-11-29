import { render, screen, within } from '@testing-library/react';
import { nanoid } from 'nanoid';
import React from 'react';
import { PlayerDatabase } from '../../../types/CoveyTownSocket';
import Connect4Leaderboard from './Connect4Leaderboard';

describe('[T4] Leaderboard', () => {
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

  const winner = nanoid(); //two wins, one tie
  const middle = nanoid(); //one win, one tie, two loss
  const loser = nanoid(); //one loss
  const results: PlayerDatabase[] = [
    {
      username: winner,
      whatTown: nanoid(),
      playerId: nanoid(),
      elo: 2500,
      wins: 118,
      losses: 3,
      ties: 5,
    },
    {
      username: middle,
      whatTown: nanoid(),
      playerId: nanoid(),
      elo: 1000,
      wins: 0,
      losses: 0,
      ties: 5,
    },
    {
      username: loser,
      whatTown: nanoid(),
      playerId: nanoid(),
      elo: 50,
      wins: 3,
      losses: 123,
      ties: 0,
    },
  ];
  function checkRow(
    row: HTMLElement,
    player: string,
    elo?: number,
    wins?: number,
    losses?: number,
    ties?: number,
  ) {
    const columns = within(row).getAllByRole('gridcell');
    expect(columns).toHaveLength(5);
    expect(columns[0]).toHaveTextContent(player);
    if (elo) expect(columns[1]).toHaveTextContent(elo.toString());
    if (wins) expect(columns[2]).toHaveTextContent(wins.toString());
    if (losses) expect(columns[3]).toHaveTextContent(losses.toString());
    if (ties) expect(columns[4]).toHaveTextContent(ties.toString());
  }
  beforeEach(() => {
    render(<Connect4Leaderboard results={results} />);
  });
  it('should render a table with the correct headers', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent('Player');
    expect(headers[1]).toHaveTextContent('Elo');
    expect(headers[2]).toHaveTextContent('Wins');
    expect(headers[3]).toHaveTextContent('Losses');
    expect(headers[4]).toHaveTextContent('Ties');
  });
  it('should render a row for each player', () => {
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
  });
  it('should render the players in order of wins', () => {
    const rows = screen.getAllByRole('row');
    checkRow(rows[1], winner);
    checkRow(rows[2], middle);
    checkRow(rows[3], loser);
  });
  it('should calculate the cumulative number of wins, losses, and ties for each player', () => {
    const rows = screen.getAllByRole('row');
    checkRow(rows[1], winner, 2500, 118, 3, 0);
    checkRow(rows[2], middle, 1000, 0, 0, 5);
    checkRow(rows[3], loser, 50, 3, 123, 0);
  });
});
