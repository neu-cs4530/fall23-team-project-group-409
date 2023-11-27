import axios from 'axios';

export const writeGame = async data => {
  const response = await axios.post(`${process.env.DATABASE_URL}/api/games`, data);
  const output = response.data;
  return output;
};

export const getPlayerElo = async userID => {
  const response = await axios.get(`${process.env.DATABASE_URL}/api/users/${userID}`);
  const user = response.data[0];
  return user;
};

export const editPlayerElo = async (userID, newElo) => {
  const response = await axios.put(`${process.env.DATABASE_URL}/api/userselo/${userID}`, {
    elo: newElo,
  });
  const user = response.data;
  return user;
};

export const addPlayer = async data => {
  const response = await axios.post(`${process.env.DATABASE_URL}/api/users`, data);
  const user = response.data;
  return user;
};

export const getAllPlayersFromTown = async data => {
  const response = await axios.get(`${process.env.DATABASE_URL}/api/bytown/${data}`);
  const output = response.data;
  return output;
};
