import BucklerPotentialMatch from "../types/BucklerPotentialMatch";
import BucklerStatusData from "../types/BucklerData";

export default async function postMatch(match:BucklerPotentialMatch):Promise<BucklerStatusData> {
  if (match?.slot < 1) {
    throw new Error(`Invalid param: slot needs to be > 1, receive ${match}`);
  }
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/exchange/start';
  const response = await fetch(url, {
    body: JSON.stringify({ slot: match?.slot }),
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
  if (data?.event !== 'exchange') {
    throw new Error(`Buckler Response: ${data?.event || data?.message}`);
  }
  return data;
}
