import { z } from "zod";
import { mealStatusSchema } from "../schemas/statusSchema";

export default async function postFeed():Promise<z.infer<typeof mealStatusSchema>> {
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/serving';
  const response = await fetch(url, {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const resJson = await response.json();
  if (resJson?.data?.event !== 'meal') {
    throw new Error(`Buckler Response: ${resJson?.data?.event}`);
  }
  const data = {
    event: 'meal',
    ...resJson.data,
  };
  return data;
}
