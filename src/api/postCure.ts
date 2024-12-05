import BucklerStatusData from "../types/BucklerStatusData";

export default async function postCure():Promise<BucklerStatusData> {
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/cure';
  const response = await fetch(url, {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const resJson = await response.json();
  if (resJson?.data?.event !== 'cure') {
    throw new Error(`Buckler Response: ${resJson?.data?.event}`);
  }
  const data = {
    event: 'cure',
    ...resJson.data,
  };
  return data;
}
