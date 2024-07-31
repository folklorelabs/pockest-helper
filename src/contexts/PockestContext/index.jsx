import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import getRandomMinutes from '../../utils/getRandomMinutes';

import {
  getStateFromLocalStorage,
  saveStateToLocalStorage,
} from './state';
import REDUCER from './reducer';
import {
  pockestInit,
} from './actions';

export * as pockestActions from './actions';
export * as pockestGetters from './getters';

const initialState = getStateFromLocalStorage();

const PockestContext = createContext({
  pockestState: initialState,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);

  useEffect(() => {
    saveStateToLocalStorage(pockestState);
  }, [pockestState]);

  // grab data on init
  useEffect(() => {
    let initTimeout;
    const init = async () => {
      pockestDispatch(await pockestInit());
      const timeoutMs = getRandomMinutes(60);
      initTimeout = window.setTimeout(init, timeoutMs);
    };
    init();
    return () => {
      window.clearTimeout(initTimeout);
    };
  }, []);

  // wrap value in memo so we only re-render when necessary
  const providerValue = useMemo(() => ({
    pockestState,
    pockestDispatch,
  }), [pockestState, pockestDispatch]);

  return (
    <PockestContext.Provider value={providerValue}>
      {children}
    </PockestContext.Provider>
  );
}
PockestProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export function usePockestContext() {
  return useContext(PockestContext);
}
