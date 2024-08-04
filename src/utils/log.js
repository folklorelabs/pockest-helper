export default function log(...args) {
  const now = new Date();
  console.log(`[${now.toLocaleString()}]`, ...args);
}
