import axios from 'axios';

export const writeGame = async data => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/games`, data);
  const output = response.data;
  return output;
};

export const getPlayerElo = async userID => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/users/${userID}`,
  );
  const user = response.data[0];
  return user;
};

export const getPlayerInfo = async userID => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/users/${userID}`,
  );
  const user = response.data;
  return user;
};

export const editPlayerElo = async (userID, newElo) => {
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/userselo/${userID}`,
    {
      elo: newElo,
    },
  );
  const user = response.data;
  return user;
};

export const addPlayer = async data => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/users`, data);
  const user = response.data;
  return user;
};

export const getAllPlayersFromTown = async data => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/bytown/${data}`,
  );
  const output = response.data;
  return output;
};

export const getMoves = async gameID => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/games/${gameID}`,
  );
  const { yellowMoves, redMoves } = response.data;
  return { redMoves, yellowMoves };
};

export const getYellowFromGame = async gameID => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/games/${gameID}`,
  );
  const { yellowPlayer } = response.data;
  return yellowPlayer;
};

export const getRedFromGame = async gameID => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/games/${gameID}`,
  );
  const { redPlayer } = response.data;
  return redPlayer;
};

export const getGames = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/games`);
  const games = response.data;
  return games;
};
