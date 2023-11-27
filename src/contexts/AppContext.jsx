import React from 'react';
import PropTypes from 'prop-types';

// STATE
const INITIAL_STATE = {
  showLog: false,
};

const AppContext = React.createContext(INITIAL_STATE);

export function AppProvider({
  children,
}) {
  const [showLog, setShowLog] = React.useState(INITIAL_STATE.showLog);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    showLog,
    setShowLog,
  }), [showLog]);

  return (
    <AppContext.Provider value={providerValue}>
      {children}
    </AppContext.Provider>
  );
}
AppProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export function useAppContext() {
  return React.useContext(AppContext);
}
