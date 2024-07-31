export default async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response type ${typeof data}`);
  return data;
}
