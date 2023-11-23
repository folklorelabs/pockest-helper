import React from 'react';
import fetchAllMonsters from '../utils/fetchAllMonsters';

function useMonsters() {
  const [allMonsters, setAllMonsters] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      const newMonsters = await fetchAllMonsters();
      setAllMonsters(newMonsters || []);
    })();
  }, []);
  return allMonsters;
}

export default useMonsters;
