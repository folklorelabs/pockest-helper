import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

function AppMain({
  className,
  content,
  footer,
}) {
  return (
    <>
      <div className={cx('AppMain', className)}>
        {content}
      </div>
      {footer ? (
        <div className="AppMain-footer">
          {footer}
        </div>
      ) : ''}
    </>
  );
}

AppMain.defaultProps = {
  className: '',
  footer: null,
};

AppMain.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  footer: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default AppMain;
