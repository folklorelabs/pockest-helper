import { pockestGetters } from '../contexts/PockestContext';
import { postDiscordTest } from './postDiscord';

async function testDiscord() {
  const pockestState = JSON.parse(window.sessionStorage.PockestHelperState);
  const matchData = {
    event: 'exchange',
    exchangeResult: {
      egg_get: false,
      egg_hash: '0003-qYaoQCHI',
      egg_id: 3,
      egg_name: '黄水玉のタマゴ',
      egg_name_en: 'Yellow Polka-dot Egg',
      egg_point_per_after: 56.43,
      egg_point_per_before: 45.93,
      get_egg_point: 1050,
      get_memento_point: 0,
      is_spmatch: true,
      memento_get: false,
      memento_hash: '4012-mogpqmds',
      memento_point_per_after: 100,
      memento_point_per_before: 100,
      target_monster_hash: '4016-BNlDPptw',
      target_monster_id: 4016,
    },
    monster: {
      age: 5,
      exchange_time: 1701281504000,
      exchange_time_par: 0,
      garbage: 0,
      hash: '4012-UWJyGwgR',
      live_time: 1700673213000,
      live_time_d: 1700673213000,
      max_memento_point: 4500,
      memento_flg: 0,
      memento_hash: '4012-mogpqmds',
      memento_name: '猛牛グローブ',
      memento_name_en: 'Raging Bull Glove',
      memento_point: 5604,
      name: 'バイソン',
      name_en: 'Balrog',
      power: 3038,
      speed: 0,
      status: 2,
      stomach: 6,
      technic: 0,
      training_is_fever: false,
      training_time: 1701235613000,
      training_time_par: 6,
    },
    next_big_event_timer: 1701278013000,
    next_small_event_timer: 1701199629000,
    stamp: false,
  };
  const matchArgs = {
    match: {
      fighters_id: 'Darkkaz20',
      hash: '4051-SBvNoTyb',
      monster_id: 4051,
      name: 'ヤン',
      name_en: 'Yang',
      power: 0,
      short_id: 3167258607,
      slot: 1,
      speed: 550,
      technic: 0,
    },
  };
  const chunData = {
    ...pockestState?.data,
    monster: {
      ...pockestState?.data?.monster,
      age: 5,
      exchange_time: 1723750557000,
      exchange_time_par: 29,
      garbage: 0,
      hash: '4004-eJcEMJMX',
      live_time: 1723275084000,
      live_time_d: 1723275084000,
      max_memento_point: 4000,
      memento_flg: 0,
      memento_hash: '4004-bFwrKIMX',
      memento_name: 'トゲ腕輪',
      memento_name_en: 'Spiked Bracelet',
      memento_point: 4301,
      name: '春麗',
      name_en: 'Chun-Li',
      power: 0,
      speed: 2018,
      status: 1,
      stomach: 6,
      technic: 0,
      training_is_fever: false,
      training_time: 1723707355000,
      training_time_par: 58,
    },
  };
  const reports = [
    await pockestGetters.getDiscordReportEvoSuccess(pockestState, pockestState?.data),
    pockestGetters.getDiscordReportEvoFailure(pockestState, pockestState?.data),
    await pockestGetters.getDiscordReportMemento(pockestState, pockestState?.data),
    await pockestGetters.getDiscordReportMemento(pockestState, chunData),
    pockestGetters.getDiscordReportMatch(pockestState, matchData, matchArgs),
    await pockestGetters.getDiscordReportSighting(pockestState, matchData, matchArgs),
  ];
  const content = `${reports.map((r) => r.content).join('\n')}`;
  const files = reports.reduce((acc, r) => [
    ...acc,
    ...(r.files || []),
  ], []);
  const embeds = reports.reduce((acc, r) => [
    ...acc,
    ...(r.embeds || []),
  ], []);
  const options = { content, files, embeds };
  await postDiscordTest(options);
  return options;
}

export default testDiscord;
