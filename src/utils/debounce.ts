export default function debounce(func: (...args: unknown[]) => void, timeout = 100): (...args: unknown[]) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func(...args); }, timeout);
  };
}
