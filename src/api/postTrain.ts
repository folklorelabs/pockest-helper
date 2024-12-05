import BucklerStatusData from "../types/BucklerData";

export default async function postTrain(matchType:number):Promise<BucklerStatusData> {
  if (matchType < 1 || matchType > 3) {
    throw new Error(`Invalid param: type needs to be 1, 2, or 3. Received ${matchType}.`);
  }
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/training';
  const response = await fetch(url, {
    body: `{"type":${matchType}}`,
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
  if (data?.event !== 'training') {
    throw new Error(`Buckler Response: ${data?.event || data?.message}`);
  }
  return data;
}
