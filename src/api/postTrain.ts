import BucklerStatusData from "../types/BucklerStatusData";

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
  if (resJson?.data?.event !== 'training') {
    throw new Error(`Buckler Response: ${resJson?.data?.event}`);
  }
  const data = {
    event: 'training',
    ...resJson.data,
  };
  return data;
}
