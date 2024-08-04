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
  startStorageSession,
  validateStorageSession,
  getStateFromLocalStorage,
  getStateFromSessionStorage,
  saveStateToLocalStorage,
  saveStateToSessionStorage,
} from './state';
import REDUCER from './reducer';
import {
  pockestInit,
  pockestInvalidateSession,
} from './actions';

export * as pockestActions from './actions';
export * as pockestGetters from './getters';

startStorageSession();
const initialStateFromStorage = getStateFromSessionStorage();
const initialState = initialStateFromStorage || getStateFromLocalStorage();

const PockestContext = createContext({
  pockestState: initialState,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);

  useEffect(() => {
    if (pockestState?.invalidSession) return;
    if (!validateStorageSession()) {
      // session invalid, we opened a new tab or something. invalidate the session in state.
      (async () => {
        pockestDispatch(await pockestInvalidateSession());
      })();
      return;
    }
    saveStateToLocalStorage(pockestState);
    saveStateToSessionStorage(pockestState);
  }, [pockestState]);

  // grab data on init
  useEffect(() => {
    let rafId;
    const init = async () => {
      const nextInitStr = window.sessionStorage.getItem('PockestHelperNextInit');
      const nextInit = nextInitStr ? parseInt(nextInitStr, 10) : Date.now();
      if (Date.now() >= nextInit) {
        const newNextInit = Date.now() + getRandomMinutes(60);
        window.sessionStorage.setItem('PockestHelperNextInit', newNextInit);
        pockestDispatch(await pockestInit());
      }
      rafId = window.requestAnimationFrame(init);
    };
    init();
    return () => {
      window.cancelAnimationFrame(rafId);
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
