import React from 'react';
import fetchAllEggs from '../utils/fetchAllEggs';

function useEggs() {
  const [allEggs, setAllEggs] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      const newEggs = await fetchAllEggs();
      setAllEggs(newEggs || []);
    })();
  }, []);
  return allEggs;
}

export default useEggs;
