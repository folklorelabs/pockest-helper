import React from 'react';
import cx from 'classnames';

import {
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import Memento from '../Memento';

interface SimplePlanProps {
  rows?: number;
}

const SimplePlan: React.FC<SimplePlanProps> = ({
  rows = 12,
}) => {
  const textAreaEl = React.useRef<HTMLDivElement>(null);
  const {
    pockestState,
  } = usePockestContext();
  const schedule = React.useMemo(() => pockestGetters.getPlanLog(pockestState).map((d) => ({
    ...d,
    icon: (() => {
      if (d.completion) return '☑';
      if (d.missed) return '⚠';
      return '☐';
    })(),
    dateStr: (new Date(d.start)).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }),
    timeStr: (new Date(d.start)).toLocaleString([], { hour: 'numeric', minute: 'numeric' }),
  })), [pockestState]);
  const scheduleLinesGrouped: Record<string, typeof schedule[0][]> = React.useMemo(() => schedule.reduce((groups: Record<string, typeof schedule[0][]>, d) => ({
    ...groups,
    [d.dateStr]: [
      ...(groups[d.dateStr] || []),
      d,
    ],
  }), {}), [schedule]);
  React.useEffect(() => {
    if (!textAreaEl?.current) return () => { };
    const lineHeight = textAreaEl.current.scrollHeight / (schedule.length + 1);
    const lastSuccessIndex = schedule?.reduce(
      (latestIndex, item, itemIndex) => (item?.completion ? itemIndex : latestIndex),
      0,
    );
    const fromTop = Math.max(0, lineHeight * (lastSuccessIndex - rows / 2 + 1));
    textAreaEl.current.scrollTop = fromTop;
    return () => { };
  }, [rows, schedule]);
  return (
    <div className="SimplePlan">
      <div className="SimplePlan-content">
        {Object.keys(scheduleLinesGrouped).map((dateStr) => (
          <div key={dateStr} className="SimplePlan-day">
            <h1
              className={cx(
                'SimplePlanDay',
                {
                  'SimplePlanDay--completion': !scheduleLinesGrouped[dateStr].find((d) => !d.completion && !d.missed),
                },
              )}
            >
              {dateStr}
            </h1>
            {scheduleLinesGrouped[dateStr].map((d) => (
              <div
                key={`${d.dateStr}_${d.label}_${d.timeStr}`}
                className={cx(
                  'PockestLine',
                  'SimplePlanEvent',
                  {
                    'SimplePlanEvent--completion': d.completion,
                    'SimplePlanEvent--missed': d.missed,
                  },
                )}
              >
                <p>
                  {d.icon}
                  {' '}
                  {d.label}
                  {d.label === 'Departure' ? <Memento /> : ''}
                </p>
                <p className="SimplePlanEventTime PockestToolTip PockestToolTip--left PockestToolTip--bottom">
                  {d.timeStr}
                  <span className="PockestToolTip-text">
                    All times are aproximations.
                    Actual task execution times may vary by a few minutes
                    and this shouldn&apos;t affect the final outcomes.
                  </span>
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePlan;
