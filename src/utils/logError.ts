 
interface LogError {
  (...args: unknown[]): void;
}

const logError: LogError = (...args) => {
  // const now = new Date();
  console.error(...args);
};

export default logError;
