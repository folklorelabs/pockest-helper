import BucklerMatchListData from "../types/BucklerMatchListData";

export default async function fetchMatchList():Promise<BucklerMatchListData> {
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/exchange/list';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const { data } = await response.json();
  return data;
}