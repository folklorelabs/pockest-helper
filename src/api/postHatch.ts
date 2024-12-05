import BucklerStatusData from "../types/BucklerData";

export default async function postHatch(eggId:number):Promise<BucklerStatusData> {
  if (eggId < 1) throw new Error(`Invalid param: id needs to be > 0, received ${eggId}`);
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/eggs';
  const response = await fetch(url, {
    body: `{"id":${eggId}}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const resJson = await response.json();
  const data = {
    event: resJson.event,
    ...resJson.data,
  };
  if (data?.event !== 'hatching') {
    throw new Error(`Buckler Response: ${data?.event || data?.message}`);
  }
  return data;
}
