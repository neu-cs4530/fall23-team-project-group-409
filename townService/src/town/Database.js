import axios from 'axios';

export const writeGame = async data => {
  const response = await axios.post('http://localhost:4000/api/games', data);
  const user = response.data;
  return user;
};

export const getPlayerElo = async userID => {
  const response = await axios.get(`http://localhost:4000/api/users/${userID}`);
  const user = response.data;
  return user;
};

export const editPlayerElo = async (userID, newElo) => {
  const response = await axios.put(`http://localhost:4000/api/userselo/${userID}`, { elo: newElo });
  const user = response.data;
  return user;
};

// getPlayerElo({ username: 'andrew', townId: 'townGang' });
// addPlayer({ username: 'andrew', password: 'testPassword', elo: 1000, whatTown: 'townGang' });
// editPlayerElo('andrew', 1500);
