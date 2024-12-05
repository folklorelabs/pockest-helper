import React from 'react';

function useNow() {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return now;
}

export default useNow;
