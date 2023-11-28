import axios from 'axios';

export const getAllPlayersInTown = async data => {
  console.log(process.env.DATABASE_URL);
  console.log(process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL);
  const response = await axios.get(`http://localhost:4000/api/bytown/${data}`);
  const output = response.data;
  return output;
};
