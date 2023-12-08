export const STAT_ICON = {
  1: '🏋️',
  2: '🏃🏻',
  3: '🤸🏻',
};

export const STAT_ID = {
  1: 'power',
  2: 'speed',
  3: 'technic',
};

export const STAT_ID_ICON = Object.keys(STAT_ID).reduce((all, k) => ({
  ...all,
  [STAT_ID[k]]: STAT_ICON[k],
}), {});

export const STAT_ABBR = Object.keys(STAT_ID).reduce((all, k) => ({
  ...all,
  [STAT_ID[k].toUpperCase().slice(0, 1)]: parseInt(k, 10),
}), {});
