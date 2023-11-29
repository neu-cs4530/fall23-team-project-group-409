/* eslint-disable consistent-return */
/* eslint-disable no-useless-return */
import axios from 'axios';

export const writeGame = async data => {
  try {
    const response = await axios.post(`${process.env.DATABASE_URL}/api/games`, data);
    const output = response.data;
    return output;
  } catch (error) {
    return;
  }
};

export const getPlayerInfo = async userID => {
  try {
    const response = await axios.get(`${process.env.DATABASE_URL}/api/users/${userID}`);
    const user = response.data[0];
    return user;
  } catch (error) {
    return;
  }
};

export const editPlayerInfo = async (userID, newElo, newWins, newLosses, newTies) => {
  try {
    const response = await axios.put(`${process.env.DATABASE_URL}/api/userselo/${userID}`, {
      elo: newElo,
      wins: newWins,
      losses: newLosses,
      ties: newTies,
    });
    const user = response.data;
    return user;
  } catch (error) {
    return;
  }
};

export const addPlayer = async data => {
  try {
    const response = await axios.post(`${process.env.DATABASE_URL}/api/users`, data);
    const user = response.data;
    return user;
  } catch (error) {
    return;
  }
};

export const getAllPlayersFromTown = async data => {
  try {
    const response = await axios.get(`${process.env.DATABASE_URL}/api/bytown/${data}`);
    const output = response.data;
    return output;
  } catch (error) {
    return;
  }
};
