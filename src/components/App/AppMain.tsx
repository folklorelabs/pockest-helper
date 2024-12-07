import React from 'react';
import cx from 'classnames';

interface AppMainProps {
  className?: string;
  content: React.ReactNode | React.ReactNode[];
  footer?: React.ReactNode | React.ReactNode[];
}

function AppMain({
  className = '',
  content,
  footer = null,
}: AppMainProps) {
  return (
    <>
      <div
        className={cx(
          'AppMain',
          {
            'AppMain--withFooter': !!footer,
          },
          className,
        )}
      >
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

export default AppMain;
