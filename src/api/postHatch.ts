import { z } from "zod";
import { hatchingStatusSchema } from "../schemas/statusSchema";

export default async function postHatch(eggId:number):Promise<z.infer<typeof hatchingStatusSchema>> {
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
  if (resJson?.data?.event !== 'hatching') {
    throw new Error(`Buckler Response: ${resJson?.data?.event}`);
  }
  const data = {
    event: 'hatching',
    ...resJson.data,
  };
  return data;
}
