import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires

export const getAllPlayersInTown = async data => {
  console.log(process.env.NEXT_PUBLIC_TOWN_DATABASE_URL);
  console.log(process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL);
  const response = await axios.get(
    `${[process.env.NEXT_PUBLIC_TOWN_DATABASE_URL]}/api/bytown/${data}`,
  );
  const output = response.data;
  return output;
};
