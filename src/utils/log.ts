 
interface LogFunction {
  (...args: unknown[]): void;
}

const log: LogFunction = (...args) => {
  const now = new Date();
  console.log(`[${now.toLocaleString()}]`, ...args);
};

export default log;
