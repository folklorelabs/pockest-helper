export const STAT_ICON: Record<string, string> = {
  '1': '🏋️',
  '2': '🏃🏻',
  '3': '🤸🏻',
};

export const STAT_ID: Record<string, string> = {
  '1': 'power',
  '2': 'speed',
  '3': 'technic',
};

export const STAT_ID_ABBR: { [key: string]: string } = Object.keys(STAT_ID).reduce((all, id) => ({
  ...all,
  [id]: STAT_ID[id]?.toUpperCase().slice(0, 1),
}), {});

export const STAT_ID_ICON: { [key: string]: string } = Object.keys(STAT_ID).reduce((all, k) => ({
  ...all,
  [STAT_ID[k]]: STAT_ICON[k],
}), {});

export const STAT_ABBR: { [key: string]: string } = Object.keys(STAT_ID).reduce((all, k) => ({
  ...all,
  [STAT_ID[k].toUpperCase().slice(0, 1)]: parseInt(k, 10),
}), {});
