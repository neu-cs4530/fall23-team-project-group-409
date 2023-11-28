import { Container, Table, Tbody, Td, Thead, Tr, List, ListItem } from '@chakra-ui/react';
import React from 'react';
import { PlayerDatabase } from '../../../types/CoveyTownSocket';

// FIX THIS COMMENT
/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function Connect4Leaderboard({
  results,
}: {
  results: PlayerDatabase[];
}): JSX.Element {
  results.sort((a, b) => b.elo - a.elo);

  const playerWithHighestWins = results.reduce(
    (prevPlayer: PlayerDatabase, currentPlayer: PlayerDatabase) => {
      return currentPlayer.wins > prevPlayer.wins ? currentPlayer : prevPlayer;
    },
    results[0],
  );
  const playerWithHighestLosses = results.reduce(
    (prevPlayer: PlayerDatabase, currentPlayer: PlayerDatabase) => {
      return currentPlayer.losses > prevPlayer.losses ? currentPlayer : prevPlayer;
    },
    results[0],
  );

  return (
    <Container>
      <List aria-label='leaderboard top stats'>
        <ListItem>Most Wins: {playerWithHighestWins?.username || ''}</ListItem>
        <ListItem>Most Losses: {playerWithHighestLosses?.username || ''}</ListItem>
      </List>
      <Table>
        <Thead>
          <Tr>
            <th>Player</th>
            <th>Elo</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Ties</th>
          </Tr>
        </Thead>
        <Tbody>
          {results.map(record => {
            return (
              <Tr key={record.playerId}>
                <Td>{record.username}</Td>
                <Td>{record.elo}</Td>
                <Td>{record.wins}</Td>
                <Td>{record.losses}</Td>
                <Td>{record.ties}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Container>
  );
}
