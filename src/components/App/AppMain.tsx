import cx from 'classnames';
import React from 'react';

interface AppMainProps {
  className?: string;
  content: React.ReactNode | React.ReactNode[];
  footer?: React.ReactNode | React.ReactNode[];
}

function AppMain({ className = '', content, footer = null }: AppMainProps) {
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
      {footer ? <div className="AppMain-footer">{footer}</div> : ''}
    </>
  );
}

export default AppMain;
