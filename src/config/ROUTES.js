import MONSTER_AGE from './MONSTER_AGE';

const ROUTE_DEFAULT = {
  cleanFrequency: 2,
  feedFrequency: 4,
  cleanOffset: 0,
  feedOffset: 0,
  feedTarget: 6,
};

function getDefaultRoute(ageStart, ageEnd) {
  return {
    ...ROUTE_DEFAULT,
    ageStart,
    ageEnd,
    startTime: MONSTER_AGE[ageStart],
    endTime: MONSTER_AGE[ageEnd] - 1000, // -1s so we don't trigger another event
  };
}

const ROUTES = {
  AL: [
    {
      ...getDefaultRoute(1, 3),
    },
    {
      ...getDefaultRoute(3, 4),
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
  AR: [
    {
      ...getDefaultRoute(1, 3),
    },
    {
      ...getDefaultRoute(3, 4),
      feedFrequency: 36,
      cleanFrequency: 36,
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
  BL: [
    {
      ...getDefaultRoute(1, 3),
      cleanFrequency: 12,
    },
    {
      ...getDefaultRoute(3, 4),
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
  BR: [
    {
      ...getDefaultRoute(1, 3),
      cleanFrequency: 12,
    },
    {
      ...getDefaultRoute(3, 4),
      cleanFrequency: 36,
      feedFrequency: 36,
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
  CL: [
    {
      ...getDefaultRoute(1, 3),
      cleanFrequency: 12,
      feedFrequency: 12,
    },
    {
      ...getDefaultRoute(3, 4),
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
  CR: [
    {
      ...getDefaultRoute(1, 3),
      cleanFrequency: 24,
      feedFrequency: 24,
    },
    {
      ...getDefaultRoute(3, 4),
      cleanOffset: 12,
      feedOffset: 12,
      cleanFrequency: 12,
      feedFrequency: 12,
      feedTarget: 3,
    },
    {
      ...getDefaultRoute(4, 6),
    },
  ],
};

export default ROUTES;
