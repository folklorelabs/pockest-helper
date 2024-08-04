import React from 'react';
import PropTypes from 'prop-types';
import debounce from '../utils/debounce';

// STATE
const INITIAL_STATE = {
  showLog: false,
};

const AppContext = React.createContext(INITIAL_STATE);

export function AppProvider({
  children,
}) {
  const [showLog, setShowLog] = React.useState(INITIAL_STATE.showLog);
  const [winWidth, setWinWidth] = React.useState(window.innerWidth);
  const logStyle = React.useMemo(() => (winWidth >= 768 ? 'default' : 'compact'), [winWidth]);

  React.useEffect(() => {
    const resizeHandler = debounce(() => setWinWidth(window.innerWidth));
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    showLog,
    setShowLog,
    logStyle,
  }), [showLog, logStyle]);

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
