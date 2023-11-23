const routes = {
  A: {
    feedFrequency: 4,
    cleanFrequency: 2,
  },
  B: {
    feedFrequency: 4,
    cleanFrequency: 12,
  },
  C: {
    feedFrequency: 24,
    cleanFrequency: 24,
  },
  L: {
    feedFrequency: 4,
    cleanFrequency: 2,
  },
  R: {
    feedFrequency: 24,
    cleanFrequency: 24,
  },
  AR: [
    {
      feedFrequency: 24,
      cleanFrequency: 24,
      feedTarget: 6,
    },
    {
      feedFrequency: 24,
      cleanFrequency: 24,
      feedTarget: 3,
    },
  ],
  BR: [
    {
      feedFrequency: 24,
      cleanFrequency: 24,
      feedTarget: 6,
    },
    {
      feedFrequency: 24,
      cleanFrequency: 24,
      feedTarget: 6,
    },
  ],
  CR: [
    {
      feedFrequency: 0,
      cleanFrequency: 24,
    },
    {
      feedFrequency: 24,
      cleanFrequency: 24,
      feedTarget: 3,
    },
  ],
};

export default routes;
