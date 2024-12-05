 
export default function log(...args: unknown[]) {
  const now = new Date();
  console.log(`[${now.toLocaleString()}]`, ...args);
}
