export const ROUTE_DEFAULT = {
  cleanFrequency: 2,
  feedFrequency: 4,
  cleanOffset: 0,
  feedOffset: 0,
  feedTarget: 6,
};

export const ROUTES = {
  AL: [
    {
      ...ROUTE_DEFAULT,
    },
    {
      ...ROUTE_DEFAULT,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
  AR: [
    {
      ...ROUTE_DEFAULT,
    },
    {
      ...ROUTE_DEFAULT,
      feedFrequency: 36,
      cleanFrequency: 36,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
  BL: [
    {
      ...ROUTE_DEFAULT,
      cleanFrequency: 12,
    },
    {
      ...ROUTE_DEFAULT,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
  BR: [
    {
      ...ROUTE_DEFAULT,
      cleanFrequency: 12,
    },
    {
      ...ROUTE_DEFAULT,
      cleanFrequency: 36,
      feedFrequency: 36,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
  CL: [
    {
      ...ROUTE_DEFAULT,
      cleanFrequency: 12,
      feedFrequency: 12,
    },
    {
      ...ROUTE_DEFAULT,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
  CR: [
    {
      ...ROUTE_DEFAULT,
      cleanFrequency: 24,
      feedFrequency: 24,
    },
    {
      ...ROUTE_DEFAULT,
      cleanOffset: 12,
      feedOffset: 12,
      cleanFrequency: 12,
      feedFrequency: 12,
      feedTarget: 3,
    },
    {
      ...ROUTE_DEFAULT,
    },
  ],
};

export default ROUTES;
