export default async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected API response type ${typeof data} (${url})`);
  return data;
}
